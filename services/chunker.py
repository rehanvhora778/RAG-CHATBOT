"""
Module 6: Chunking
Splits extracted page text into overlapping chunks for embedding.
"""
import logging
from typing import List, Dict, Any
from django.conf import settings

logger = logging.getLogger(__name__)


def split_text_into_chunks(
    text: str,
    chunk_size: int = None,
    chunk_overlap: int = None,
) -> List[Dict[str, Any]]:
    """
    Split text into overlapping word-based chunks.
    Returns list of {content, start_char, end_char, word_count}
    """
    chunk_size    = chunk_size    or settings.RAG_CHUNK_SIZE
    chunk_overlap = chunk_overlap or settings.RAG_CHUNK_OVERLAP

    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk_words = words[start:end]
        content = ' '.join(chunk_words)

        # Calculate character positions
        start_char = len(' '.join(words[:start])) + (1 if start > 0 else 0)
        end_char = start_char + len(content)

        chunks.append({
            'content': content,
            'start_char': start_char,
            'end_char': end_char,
            'word_count': len(chunk_words),
        })

        if end == len(words):
            break
        start = end - chunk_overlap

    return chunks


def chunk_pages(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Chunk all pages from a document, preserving page number metadata.
    Returns list of chunk dicts ready for embedding and MongoDB storage.
    """
    all_chunks = []
    global_index = 0

    for page in pages:
        page_number = page['page_number']
        page_content = page['content']

        page_chunks = split_text_into_chunks(page_content)

        for chunk in page_chunks:
            all_chunks.append({
                'chunk_index': global_index,
                'page_number': page_number,
                'content': chunk['content'],
                'start_char': chunk['start_char'],
                'end_char': chunk['end_char'],
                'word_count': chunk['word_count'],
            })
            global_index += 1

    logger.info("Chunked %d pages into %d chunks", len(pages), len(all_chunks))
    return all_chunks
