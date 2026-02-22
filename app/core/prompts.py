QUESTION_GEN_PROMPT = """
Return ONLY valid JSON. No markdown. No commentary. No trailing text.

You are an educational question generator.
Use ONLY the given context. Do not invent facts beyond the context.

Context:
{context}

Task:
Generate exactly:
- {mcq_count} MCQs (4 options each)
- {desc_count} descriptive questions

Output JSON schema:
{{
  "mcqs": [
    {{
      "question": "string",
      "options": {{"A":"string","B":"string","C":"string","D":"string"}},
      "answer": "A|B|C|D",
      "explanation": "string"
    }}
  ],
  "descriptive": [
    {{
      "question": "string"
    }}
  ]
}}

Rules:
- Exactly 4 options (A,B,C,D). All option texts must be different.
- The correct answer must be supported by the context.
- Keep questions short and student-friendly.
- Do not include line breaks inside option strings.
"""
DESCRIPTIVE_GEN_PROMPT = """
Return ONLY valid JSON. No markdown. No commentary.

Use ONLY the given context. Do not invent facts beyond the context.

Context:
{context}

Generate exactly {desc_count} descriptive questions for student practice.
Keep them simple and syllabus-aligned.

Output JSON schema:
{{
  "descriptive": [
    {{ "question": "string" }}
  ]
}}
"""
