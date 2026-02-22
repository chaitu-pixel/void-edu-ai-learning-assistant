from __future__ import annotations

import uuid
from typing import Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.services.question_gen import generate_questions
from app.services.quiz_eval import evaluate_mcq_quiz

router = APIRouter(tags=["quiz"])

# In-memory quiz store (no DB for core working)
QUIZ_STORE: Dict[str, dict] = {}


class QuizCreateRequest(BaseModel):
    topic: str
    top_k: int | None = None


class QuizSubmitRequest(BaseModel):
    answers: Dict[str, str]  # {"q1":"A","q2":"B",...}


@router.post("/quiz/create")
def create_quiz(req: QuizCreateRequest):
    top_k = req.top_k or settings.DEFAULT_TOP_K

    # Generate questions (locked 10 MCQs + 5 descriptive)
    data = generate_questions(req.topic, top_k=top_k, mcq_count=10, desc_count=5)

    quiz_id = f"quiz_{uuid.uuid4().hex[:10]}"

    # Store only MCQs for evaluation (descriptive not evaluated)
    QUIZ_STORE[quiz_id] = {
        "topic": req.topic,
        "mcqs": data["mcqs"],
        "sources": data.get("sources", []),
    }

    return {
        "quiz_id": quiz_id,
        "topic": req.topic,
        "mcq_count": len(data["mcqs"]),
        "mcqs": data["mcqs"],          # UI needs questions/options
        "sources": data.get("sources", [])
    }


@router.post("/quiz/{quiz_id}/submit")
def submit_quiz(quiz_id: str, req: QuizSubmitRequest):
    quiz = QUIZ_STORE.get(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    result = evaluate_mcq_quiz(quiz["mcqs"], req.answers)

    return {
        "quiz_id": quiz_id,
        "topic": quiz["topic"],
        **result
    }
