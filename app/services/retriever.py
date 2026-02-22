import json
from pathlib import Path

import faiss
import numpy as np

from app.services.embedder import embed_texts

FAISS_DIR = Path("storage/faiss")
INDEX_FILE = FAISS_DIR / "index.faiss"
META_FILE = FAISS_DIR / "metadata.json"


def retrieve(question: str, top_k: int = 5):
    index = faiss.read_index(str(INDEX_FILE))

    with open(META_FILE, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    # clamp top_k to available chunks
    k = min(max(int(top_k), 1), len(metadata))

    q_emb = embed_texts([question])
    distances, indices = index.search(np.array(q_emb), k)

    seen = set()
    results = []
    for idx in indices[0]:
        # FAISS may return -1 in some index types; safe check
        if idx is None or idx < 0:
            continue
        if idx in seen:
            continue
        seen.add(idx)
        results.append(metadata[idx])

    return results
