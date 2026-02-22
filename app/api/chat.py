from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rag import answer_question
from app.core.config import settings

router = APIRouter(tags=["chat"])


class AskRequest(BaseModel):
    question: str
    top_k: int | None = None


@router.post("/chat/ask")
def ask_question(request: AskRequest):
    top_k = request.top_k or settings.DEFAULT_TOP_K
    return answer_question(request.question, top_k)
