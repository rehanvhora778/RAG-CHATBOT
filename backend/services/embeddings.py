"""
Module 7: Embeddings
Sentence Transformers wrapper — singleton model instance with lazy loading.
"""
import logging
from typing import List

logger = logging.getLogger(__name__)

_model = None


def get_embedding_model():
    global _model
    if _model is None:
        import os
        from sentence_transformers import SentenceTransformer
        from django.conf import settings

        # Use all CPU cores for encoding (torch defaults can under-subscribe).
        try:
            import torch
            torch.set_num_threads(os.cpu_count() or 1)
        except Exception:
            pass

        model_name = settings.EMBEDDING_MODEL_NAME
        logger.info("Loading embedding model: %s", model_name)
        _model = SentenceTransformer(model_name)
        logger.info("Embedding model loaded.")
    return _model


def embed_texts(texts: List[str], batch_size: int = None):
    import numpy as np
    from django.conf import settings

    if batch_size is None:
        batch_size = getattr(settings, 'EMBEDDING_BATCH_SIZE', 64)

    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    return embeddings.astype(np.float32)


def embed_query(query: str):
    return embed_texts([query])


def embed_chunks(chunks: List[dict]):
    texts = [c['content'] for c in chunks]
    return embed_texts(texts)
