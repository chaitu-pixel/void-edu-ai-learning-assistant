from pathlib import Path
import PyPDF2
import docx2txt


def load_document(path: Path) -> str:
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        text = ""
        with open(path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
        return text

    elif suffix in [".docx"]:
        return docx2txt.process(str(path))

    elif suffix in [".txt", ".md"]:
        return path.read_text(encoding="utf-8")

    else:
        raise ValueError(f"Unsupported file type: {suffix}")
