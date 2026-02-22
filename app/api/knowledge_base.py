import json
from pathlib import Path

import faiss
import numpy as np
from fastapi import APIRouter

from app.services.document_loader import load_document
from app.services.chunker import chunk_text
from app.services.embedder import embed_texts

UPLOAD_DIR = Path("storage/uploads")
FAISS_DIR = Path("storage/faiss")
INDEX_FILE = FAISS_DIR / "index.faiss"
META_FILE = FAISS_DIR / "metadata.json"

router = APIRouter(tags=["knowledge_base"])


@router.post("/kb/build")
def build_knowledge_base():
    FAISS_DIR.mkdir(parents=True, exist_ok=True)

    all_chunks = []
    metadata = []

    files = list(UPLOAD_DIR.glob("*"))
    if not files:
        return {"status": "no_files_found"}

    for file_path in files:
        text = load_document(file_path)
        chunks = chunk_text(text)

        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            metadata.append({
                "source": file_path.name,
                "chunk_id": i,
                "text": chunk
            })

    embeddings = embed_texts(all_chunks)
    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings))

    faiss.write_index(index, str(INDEX_FILE))

    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return {
        "status": "index_built",
        "total_documents": len(files),
        "total_chunks": len(all_chunks),
        "embedding_dimension": dimension
    }
