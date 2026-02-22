from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings
from app.services.question_gen import generate_questions

router = APIRouter(tags=["questions"])


class GenerateQuestionsRequest(BaseModel):
    topic: str
    top_k: int | None = None
    mcq_count: int = 10
    options: int = 4
    descriptive_count: int = 5


@router.post("/questions/generate")
def generate(req: GenerateQuestionsRequest):
    top_k = req.top_k or settings.DEFAULT_TOP_K

    # enforce our project rules
    mcq_count = 10
    desc_count = 5

    return generate_questions(
        topic_or_question=req.topic,
        top_k=top_k,
        mcq_count=mcq_count,
        desc_count=desc_count
    )
