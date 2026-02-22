import google.generativeai as genai
from app.core.config import settings


genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel("models/gemma-3-1b-it")



def generate_response(prompt: str) -> str:
    response = model.generate_content(prompt)
    return response.text
