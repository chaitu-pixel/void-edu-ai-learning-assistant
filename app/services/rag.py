from app.services.retriever import retrieve
from app.core.gemini_client import generate_response


def answer_question(question: str, top_k: int = 5):
    retrieved_chunks = retrieve(question, top_k)

    context = "\n\n".join([c["text"] for c in retrieved_chunks])

    prompt = f"""
You are an educational assistant.

Use ONLY the provided context to answer.

Context:
{context}

Question:
{question}

Answer clearly and concisely.
"""

    answer = generate_response(prompt)

    return {
        "answer": answer,
        "sources": [
            {
                "source": c["source"],
                "chunk_id": c["chunk_id"]
            }
            for c in retrieved_chunks
        ]
    }
