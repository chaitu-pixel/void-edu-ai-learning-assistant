from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.documents import router as documents_router
from app.api.knowledge_base import router as kb_router
from app.api.chat import router as chat_router
from app.api.questions import router as questions_router
from app.api.quiz import router as quiz_router

app = FastAPI(
    title="Educational Chatbot Backend",
    version="0.1.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# base route
@app.get("/")
def root():
    return {"message": "Backend running"}

# API v1 routes
app.include_router(health_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(kb_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(questions_router, prefix="/api/v1")
app.include_router(quiz_router, prefix="/api/v1")