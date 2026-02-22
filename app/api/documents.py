from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException

# Upload folder (kept simple for now)
UPLOAD_DIR = Path("storage/uploads")
MAX_FILES_PER_UPLOAD = 5

router = APIRouter(tags=["documents"])


def _safe_name(name: str) -> str:
    """
    Minimal safe filename (no paths).
    """
    name = os.path.basename(name).strip().replace(" ", "_")
    # fallback if empty
    return name or "file"


@router.post("/documents/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Upload up to 5 educational files (PDF/DOCX/TXT, etc.)
    Saves to storage/uploads/ with UUID prefix.
    Returns doc_ids for later indexing.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    if len(files) > MAX_FILES_PER_UPLOAD:
        raise HTTPException(
            status_code=400,
            detail=f"Max {MAX_FILES_PER_UPLOAD} files allowed per upload",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    saved = []
    for f in files:
        original_name = _safe_name(f.filename or "file")
        doc_id = str(uuid.uuid4())
        saved_name = f"{doc_id}__{original_name}"
        save_path = UPLOAD_DIR / saved_name

        # stream save
        content = await f.read()
        if not content:
            raise HTTPException(status_code=400, detail=f"Empty file: {original_name}")

        save_path.write_bytes(content)

        saved.append(
            {
                "doc_id": doc_id,
                "original_name": original_name,
                "stored_name": saved_name,
                "stored_path": str(save_path),
                "content_type": f.content_type,
                "size_bytes": len(content),
            }
        )

    return {
        "uploaded": len(saved),
        "max_per_upload": MAX_FILES_PER_UPLOAD,
        "docs": saved,
    }
