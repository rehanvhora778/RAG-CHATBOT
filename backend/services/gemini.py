"""
Module 9: Gemini Integration
Wraps the Google Gemini API for chat and summarization.
"""
import time
import logging
from typing import List, Dict, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

_gemini_client = None
_gemini_model_name = None


def get_gemini_model():
    global _gemini_client, _gemini_model_name
    current_model = settings.GEMINI_MODEL
    if _gemini_client is None or _gemini_model_name != current_model:
        import google.generativeai as genai
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
        genai.configure(api_key=api_key)
        _gemini_client = genai.GenerativeModel(
            model_name=current_model,
            generation_config={
                'temperature': settings.GEMINI_TEMPERATURE,
                'max_output_tokens': settings.GEMINI_MAX_OUTPUT_TOKENS,
            },
        )
        _gemini_model_name = current_model
        logger.info("Gemini model initialized: %s", current_model)
    return _gemini_client


def _call_with_retry(prompt: str, max_retries: int = 3) -> str:
    """Call Gemini with exponential backoff on rate-limit errors."""
    import google.api_core.exceptions as gexc

    model = get_gemini_model()
    delay = 10  # seconds

    for attempt in range(1, max_retries + 1):
        try:
            response = model.generate_content(prompt)
            return response.text
        except gexc.ResourceExhausted as exc:
            # Extract retry delay from the error if available
            retry_after = delay
            try:
                # The error details sometimes contain retry_delay
                err_str = str(exc)
                import re
                match = re.search(r'retry in (\d+)\.', err_str)
                if match:
                    retry_after = int(match.group(1)) + 2
            except Exception:
                pass

            if attempt < max_retries:
                logger.warning(
                    "Gemini rate limit hit (attempt %d/%d). Retrying in %ds...",
                    attempt, max_retries, retry_after
                )
                time.sleep(retry_after)
                delay *= 2
            else:
                logger.error("Gemini rate limit: all %d retries exhausted.", max_retries)
                raise
        except Exception as exc:
            logger.error("Gemini generation error: %s", exc)
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
    # Format context
    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        context_parts.append(
            f"[{i}] Document: {chunk.get('document_name', 'Unknown')}, "
            f"Page {chunk.get('page_number', '?')}\n{chunk['content']}"
        )
    context_text = "\n\n---\n\n".join(context_parts)

    # Format conversation history
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
        logger.error("Gemini RAG generation error: %s", exc)
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
        logger.error("Gemini summarization error: %s", exc)
        raise
