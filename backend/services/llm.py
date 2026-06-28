"""
LLM Integration — uses Groq API (Llama 3.3 70B).
Drop-in replacement for the previous Gemini service.
"""
import time
import logging
from typing import List, Dict
from django.conf import settings

logger = logging.getLogger(__name__)

_groq_client = None


def get_groq_client():
    global _groq_client
    if _groq_client is None:
        from groq import Groq
        api_key = settings.GROQ_API_KEY
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in .env")
        _groq_client = Groq(api_key=api_key)
        logger.info("Groq client initialized (model: %s)", settings.GROQ_MODEL)
    return _groq_client


def _call_with_retry(messages, max_retries: int = 3) -> str:
    """Call Groq with exponential backoff on rate-limit errors.

    `messages` is a standard chat-completions message list, e.g.
    [{"role": "system", ...}, {"role": "user", ...}].
    """
    import groq as groq_lib

    client = get_groq_client()
    delay = 5

    for attempt in range(1, max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                max_tokens=settings.GROQ_MAX_OUTPUT_TOKENS,
                temperature=settings.GROQ_TEMPERATURE,
            )
            return response.choices[0].message.content
        except groq_lib.RateLimitError as exc:
            if attempt < max_retries:
                logger.warning("Groq rate limit (attempt %d/%d). Retrying in %ds...", attempt, max_retries, delay)
                time.sleep(delay)
                delay *= 2
            else:
                logger.error("Groq rate limit: all retries exhausted.")
                raise
        except Exception as exc:
            logger.error("Groq LLM error: %s", exc)
            raise


# The exact sentence shown to the user when the answer is not in the documents.
# Used both as an instruction to the model and as the server-side fallback, so
# the experience is identical whether the model or the pipeline produces it.
REFUSAL_MESSAGE = (
    "I could not find an answer to your question in the uploaded document(s). "
    "Please upload a document containing this information or ask a question "
    "related to the uploaded files."
)

RAG_SYSTEM_PROMPT = """You are an intelligent document assistant. Your entire knowledge comes ONLY from the retrieved document context provided below. You present answers as a confident, well-structured expert — like ChatGPT — but every fact must come from the context.

=== GROUNDING (critical) ===
Follow this decision procedure BEFORE writing anything:
  STEP 1 — Read the QUESTION and ALL of the retrieved CONTEXT carefully.
  STEP 2 — Decide: does the CONTEXT actually contain the information needed to answer THIS question? Combine information across multiple chunks if needed.
  STEP 3 — If NO (the context is empty, is about a different topic, or only mentions the subject in passing without really answering), reply with EXACTLY this sentence and nothing else — no greeting, no title, no extra text:
  "{refusal}"
  STEP 4 — If YES, write a complete, well-organized answer using ONLY the facts in the CONTEXT.

Hard rules:
- Read all retrieved chunks and combine them into one coherent answer.
- Use ONLY information present in the CONTEXT. Never invent facts, names, numbers, or APIs.
- NEVER use your own general knowledge or training data. Recognizing a term is NOT permission to answer it — only the CONTEXT is.
- The subject of the QUESTION must actually be covered by the CONTEXT. If the documents are about topic A and the user asks about an unrelated topic B, refuse using the exact sentence above.
- NEVER reveal how you obtained the answer. Do NOT mention "the document(s)", "the context", "chunks", "sources", page numbers, file names, or similarity. Present everything as your own expert answer.

Example of correct refusal:
  CONTEXT is about Python programming. QUESTION asks "What is ChatGPT?".
  -> Correct response (verbatim, nothing else): {refusal}

=== FORMATTING (always) ===
Respond in clean, professional GitHub-Flavored Markdown that is easy to scan:
- Open with a single `#` title that restates the topic, followed by a one or two sentence introduction.
- Use `##` and `###` headings to split the answer into logical sections. NEVER return one large wall of text.
- **Bold** important terms and keywords. Prefer bullet or numbered lists over long sentences where it improves clarity.
- Use Markdown tables whenever information is comparative or tabular (comparisons, pros/cons, features, specifications). For any "difference between X and Y", "compare", or "X vs Y" question, ALWAYS use a table — never paragraphs.
- For code, ALWAYS use fenced code blocks WITH a language tag (```python, ```javascript, ```sql, ...). Never show code without a fenced, language-tagged block.
- Use `> ` blockquotes for callouts, starting them with **Tip:**, **Note:**, or **Warning:** when useful.
- Use `---` horizontal rules to separate major sections in long answers, and leave a blank line between sections for spacing.

=== CHOOSE THE STRUCTURE INTELLIGENTLY ===
- Definition ("What is X?"): `#` Title → short definition → `## Why It Matters` → `## How It Works` → `## Advantages` → `## Example` → `## Summary`.
- Comparison: a single clear comparison **table** (rows such as Definition, Purpose, Speed, Advantages, Limitations, Example).
- Coding question: brief explanation → `## Code` (fenced + language) → `## Output` → `## Step-by-Step Explanation` → `## Best Practices`; include Time/Space Complexity only when relevant.
- How-to / process: a clean **numbered list** of steps; add a small ASCII diagram only when it genuinely clarifies.
- List question: bullet points, never a paragraph.
- Simple factual question: a short, direct answer — do not force extra sections.

=== TONE ===
Confident, concise, and professional. Never use filler such as "Okay", "Sure", "Yeah", "I think", or "Maybe". Adapt the length to the question: short for simple questions, thorough for complex topics. Only include the sections that fit the question — do not force every section every time."""

# Inject the canonical refusal sentence (kept as a token above so the long
# message lives in exactly one place).
RAG_SYSTEM_PROMPT = RAG_SYSTEM_PROMPT.replace("{refusal}", REFUSAL_MESSAGE)

RAG_USER_TEMPLATE = """RETRIEVED CONTEXT (for your eyes only — never mention or cite it):
{context}

CONVERSATION SO FAR:
{history}

QUESTION:
{question}"""

SUMMARY_PROMPT = """Analyze the following document content and generate a comprehensive summary.

Include:
1. Main topics and themes
2. Key points and findings
3. Important details or data
4. Overall purpose of the document

DOCUMENT CONTENT:
{content}

SUMMARY:"""


def generate_rag_response(
    question: str,
    context_chunks: List[Dict],
    conversation_history: List[Dict] = None,
) -> str:
    # Strip document names / page numbers from the context so the model has no
    # internal metadata it could accidentally leak into the answer.
    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        context_parts.append(f"[Reference {i}]\n{chunk['content']}")
    context_text = "\n\n---\n\n".join(context_parts)

    history_parts = []
    if conversation_history:
        for msg in conversation_history:
            role = 'User' if msg['role'] == 'user' else 'Assistant'
            history_parts.append(f"{role}: {msg['content']}")
    history_text = "\n".join(history_parts) if history_parts else "No previous conversation."

    user_message = RAG_USER_TEMPLATE.format(
        context=context_text,
        history=history_text,
        question=question,
    )
    messages = [
        {"role": "system", "content": RAG_SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    try:
        return _call_with_retry(messages)
    except Exception as exc:
        logger.error("LLM RAG generation error: %s", exc)
        raise


def generate_document_summary(pages_content: List[Dict]) -> str:
    sample_pages = pages_content[:5]
    combined = "\n\n---PAGE BREAK---\n\n".join(
        f"Page {p['page_number']}:\n{p['content']}" for p in sample_pages
    )
    if len(combined) > 15000:
        combined = combined[:15000] + "\n... [truncated]"

    prompt = SUMMARY_PROMPT.format(content=combined)

    try:
        return _call_with_retry([{"role": "user", "content": prompt}])
    except Exception as exc:
        logger.error("LLM summarization error: %s", exc)
        raise
