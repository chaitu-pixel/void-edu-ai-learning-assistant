import json
import re
from typing import Any

from app.core.prompts import QUESTION_GEN_PROMPT, DESCRIPTIVE_GEN_PROMPT
from app.core.gemini_client import generate_response
from app.services.retriever import retrieve


def _cleanup_text(t: str) -> str:
    t = t.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t)
    t = re.sub(r"\s*```$", "", t)
    return t.strip()


def _best_json_parse(text: str) -> dict:
    text = _cleanup_text(text)
    try:
        return json.loads(text)
    except Exception:
        pass
    m = re.search(r"\{.*\}", text, flags=re.S)
    if not m:
        raise ValueError("No JSON object found in model output.")
    candidate = m.group(0)
    candidate = candidate.replace("\t", " ").replace("\r", " ")
    candidate = re.sub(r"(?<!\\)\n", " ", candidate)
    return json.loads(candidate)


def _normalize_mcq(mcq: dict) -> dict | None:
    if not isinstance(mcq, dict):
        return None
    q = str(mcq.get("question", "")).strip()
    if not q:
        return None

    opts = mcq.get("options")
    if not isinstance(opts, dict):
        return None

    keys = ["A", "B", "C", "D"]
    if any(k not in opts for k in keys):
        return None

    values = [str(opts[k]).replace("\n", " ").strip() for k in keys]
    if len(set(values)) != 4:
        return None

    ans = str(mcq.get("answer", "")).strip().upper()
    if ans not in keys:
        return None

    exp = str(mcq.get("explanation", "")).replace("\n", " ").strip()

    return {"question": q, "options": {k: values[i] for i, k in enumerate(keys)}, "answer": ans, "explanation": exp}


def _normalize_desc(dq: dict) -> dict | None:
    if not isinstance(dq, dict):
        return None
    q = str(dq.get("question", "")).strip()
    if not q:
        return None
    return {"question": q}


def generate_questions(topic_or_question: str, top_k: int, mcq_count: int = 10, desc_count: int = 5):
    chunks = retrieve(topic_or_question, top_k)
    context = "\n\n".join([c["text"] for c in chunks])

    # --------------------------
    # A) Generate MCQs (reliable)
    # --------------------------
    mcqs: list[dict[str, Any]] = []
    for _ in range(4):
        if len(mcqs) >= mcq_count:
            break
        prompt = QUESTION_GEN_PROMPT.format(context=context, mcq_count=mcq_count - len(mcqs), desc_count=0)
        data = _best_json_parse(generate_response(prompt))
        for m in (data.get("mcqs", []) or []):
            nm = _normalize_mcq(m)
            if nm:
                mcqs.append(nm)

        # dedupe
        seen = set()
        dedup = []
        for m in mcqs:
            if m["question"] in seen:
                continue
            seen.add(m["question"])
            dedup.append(m)
        mcqs = dedup[:mcq_count]

    # -------------------------------
    # B) Generate Descriptive (separate)
    # -------------------------------
    descriptive: list[dict[str, Any]] = []
    for _ in range(4):
        if len(descriptive) >= desc_count:
            break
        prompt = DESCRIPTIVE_GEN_PROMPT.format(context=context, desc_count=desc_count - len(descriptive))
        data = _best_json_parse(generate_response(prompt))
        for d in (data.get("descriptive", []) or []):
            nd = _normalize_desc(d)
            if nd:
                descriptive.append(nd)

        # dedupe
        seen = set()
        dedup = []
        for d in descriptive:
            if d["question"] in seen:
                continue
            seen.add(d["question"])
            dedup.append(d)
        descriptive = dedup[:desc_count]

    # Assign IDs
    mcqs_out = [{"id": f"q{i}", **m} for i, m in enumerate(mcqs[:mcq_count], start=1)]
    desc_out = [{"id": f"d{i}", **d} for i, d in enumerate(descriptive[:desc_count], start=1)]

    return {
        "mcqs": mcqs_out,
        "descriptive": desc_out,
        "sources": [{"source": c["source"], "chunk_id": c["chunk_id"]} for c in chunks],
        "counts": {"mcq": len(mcqs_out), "descriptive": len(desc_out)},
    }
