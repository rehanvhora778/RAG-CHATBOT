"""
Module 8: FAISS Vector Store — lazy imports, per-user on-disk indexes.
"""
import logging
from pathlib import Path
from typing import List, Tuple

logger = logging.getLogger(__name__)


def _index_path(user_id, document_id: str) -> Path:
    from django.conf import settings
    base = Path(settings.FAISS_INDEX_DIR) / str(user_id)
    base.mkdir(parents=True, exist_ok=True)
    return base / f"{document_id}.index"


def _meta_path(user_id, document_id: str) -> Path:
    from django.conf import settings
    base = Path(settings.FAISS_INDEX_DIR) / str(user_id)
    base.mkdir(parents=True, exist_ok=True)
    return base / f"{document_id}.meta.npy"


def save_index(user_id, document_id: str, embeddings, chunk_ids: List[str]) -> None:
    import faiss
    import numpy as np

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    faiss.write_index(index, str(_index_path(user_id, document_id)))
    np.save(str(_meta_path(user_id, document_id)), np.array(chunk_ids))
    logger.info("FAISS index saved for document %s (%d vectors)", document_id, index.ntotal)


def load_index(user_id, document_id: str):
    import faiss
    import numpy as np

    idx_path  = _index_path(user_id, document_id)
    meta_path = _meta_path(user_id, document_id)

    if not idx_path.exists() or not meta_path.exists():
        raise FileNotFoundError(f"FAISS index not found for document {document_id}")

    index     = faiss.read_index(str(idx_path))
    chunk_ids = np.load(str(meta_path), allow_pickle=True).tolist()
    return index, chunk_ids


def delete_index(user_id, document_id: str) -> None:
    for path in [_index_path(user_id, document_id), _meta_path(user_id, document_id)]:
        if path.exists():
            path.unlink()
            logger.info("Deleted FAISS file: %s", path)


def search_index(user_id, document_id: str, query_embedding, top_k: int = None) -> List[Tuple[str, float]]:
    from django.conf import settings
    import numpy as np

    top_k = top_k or settings.RAG_TOP_K
    try:
        index, chunk_ids = load_index(user_id, document_id)
        k = min(top_k, index.ntotal)
        if k == 0:
            return []
        distances, indices = index.search(query_embedding, k)
        return [
            (chunk_ids[idx], float(dist))
            for dist, idx in zip(distances[0], indices[0])
            if idx >= 0
        ]
    except FileNotFoundError:
        logger.warning("Index missing for document %s, skipping.", document_id)
        return []


def search_multiple_indexes(user_id, document_ids: List[str], query_embedding, top_k: int = None) -> List[Tuple[str, float]]:
    from django.conf import settings
    top_k = top_k or settings.RAG_TOP_K
    all_results = []
    for doc_id in document_ids:
        all_results.extend(search_index(user_id, doc_id, query_embedding, top_k=top_k))
    all_results.sort(key=lambda x: x[1], reverse=True)
    return all_results[:top_k]


def index_exists(user_id, document_id: str) -> bool:
    return _index_path(user_id, document_id).exists()
