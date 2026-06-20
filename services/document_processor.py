"""
Document processing pipeline: extract → chunk → embed → store in FAISS + MongoDB.
All ML imports are lazy to avoid startup failures when packages aren't installed yet.
"""
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)


def process_document(document_id: str, user_id: int, file_path: str, file_type: str) -> None:
    from bson import ObjectId
    from core.mongo import documents_col, chunks_col
    from core.constants import STATUS_PROCESSING, STATUS_COMPLETED, STATUS_FAILED
    from services.text_extractor import extract_text, get_word_count
    from services.chunker import chunk_pages
    from services.embeddings import embed_chunks
    from services.faiss_store import save_index
    from services.llm import generate_document_summary

    doc_oid = ObjectId(document_id)

    try:
        documents_col().update_one(
            {'_id': doc_oid},
            {'$set': {'status': STATUS_PROCESSING, 'updated_at': timezone.now()}},
        )

        logger.info("Extracting text from %s (type=%s)", file_path, file_type)
        pages = extract_text(file_path, file_type)
        if not pages:
            raise ValueError(
                "No text could be extracted from this document. "
                "The file may be corrupted or in an unsupported format."
            )
        # Filter out pure placeholder pages for chunking/embedding, but keep for summary
        real_pages = [p for p in pages if not p['content'].startswith('[Page ')]
        if not real_pages:
            logger.warning("Only placeholder pages found — document may be fully image-based with no OCR.")
            # Use placeholders anyway so the document doesn't hard-fail
            real_pages = pages

        word_count = get_word_count(real_pages)
        page_count = len(pages)

        logger.info("Chunking %d pages", len(real_pages))
        chunks = chunk_pages(real_pages)
        if not chunks:
            raise ValueError("Chunking produced no results.")

        logger.info("Embedding %d chunks", len(chunks))
        embeddings = embed_chunks(chunks)

        chunk_docs = []
        for chunk in chunks:
            chunk_docs.append({
                'document_id': document_id,
                'user_id':     user_id,
                'content':     chunk['content'],
                'chunk_index': chunk['chunk_index'],
                'page_number': chunk['page_number'],
                'start_char':  chunk['start_char'],
                'end_char':    chunk['end_char'],
                'word_count':  chunk['word_count'],
                'created_at':  timezone.now(),
            })

        insert_result = chunks_col().insert_many(chunk_docs)
        chunk_ids_for_faiss = [str(oid) for oid in insert_result.inserted_ids]

        save_index(user_id, document_id, embeddings, chunk_ids_for_faiss)

        logger.info("Generating AI summary for document %s", document_id)
        try:
            summary = generate_document_summary(real_pages)
        except Exception as exc:
            logger.warning("Summary generation failed: %s", exc)
            summary = "Summary could not be generated."

        documents_col().update_one(
            {'_id': doc_oid},
            {
                '$set': {
                    'status':      STATUS_COMPLETED,
                    'page_count':  page_count,
                    'word_count':  word_count,
                    'chunk_count': len(chunks),
                    'summary':     summary,
                    'updated_at':  timezone.now(),
                }
            },
        )
        logger.info(
            "Document %s processed: %d pages, %d chunks, %d words",
            document_id, page_count, len(chunks), word_count,
        )

    except Exception as exc:
        logger.error("Document processing failed for %s: %s", document_id, exc, exc_info=True)
        from bson import ObjectId as ObjId
        documents_col().update_one(
            {'_id': doc_oid},
            {'$set': {
                'status': 'failed',
                'error_message': str(exc),
                'updated_at': timezone.now(),
            }},
        )
        raise
