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


def _call_with_retry(prompt: str, max_retries: int = 3) -> str:
    """Call Groq with exponential backoff on rate-limit errors."""
    import groq as groq_lib

    client = get_groq_client()
    delay = 5

    for attempt in range(1, max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
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


RAG_SYSTEM_PROMPT = """You are an intelligent AI assistant that answers questions based strictly on the provided document context.

RULES:
1. Answer ONLY based on the provided context below.
2. If the answer is not in the context, say "I couldn't find information about this in the provided documents."
3. Always cite your sources using [Doc: <document_name>, Page: <page_number>] inline.
4. Be concise, accurate, and helpful.
5. If multiple documents are relevant, synthesize information across them.
6. Use the conversation history for follow-up questions.

CONTEXT:
{context}

CONVERSATION HISTORY:
{history}

USER QUESTION: {question}

ANSWER (with inline citations):"""

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
    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        context_parts.append(
            f"[{i}] Document: {chunk.get('document_name', 'Unknown')}, "
            f"Page {chunk.get('page_number', '?')}\n{chunk['content']}"
        )
    context_text = "\n\n---\n\n".join(context_parts)

    history_parts = []
    if conversation_history:
        for msg in conversation_history:
            role = 'User' if msg['role'] == 'user' else 'Assistant'
            history_parts.append(f"{role}: {msg['content']}")
    history_text = "\n".join(history_parts) if history_parts else "No previous conversation."

    prompt = RAG_SYSTEM_PROMPT.format(
        context=context_text,
        history=history_text,
        question=question,
    )

    try:
        return _call_with_retry(prompt)
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
        return _call_with_retry(prompt)
    except Exception as exc:
        logger.error("LLM summarization error: %s", exc)
        raise
