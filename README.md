# 🎓 Void Edu – AI Learning Assistant

An AI-powered educational assistant that uses **Retrieval-Augmented Generation (RAG)** to answer questions from students' study materials.

Void Edu allows students to upload their learning documents and interact with an AI assistant that provides context-aware answers based on the uploaded content. It also supports quiz generation and practice-question generation for self-learning.

> **Academic Team Project**
> My contribution covered the project end-to-end, including frontend development, backend APIs, document processing, RAG implementation, AI integration, vector search, quiz/question generation, testing, and debugging.

---

## ✨ Features

### 📄 Document Upload

* Upload PDF, DOCX, and TXT study materials.
* Process uploaded documents and extract their text content.

### 🤖 AI Chat

* Ask questions about uploaded study materials.
* Generate context-aware answers using RAG.
* Uses Google Gemini for AI-generated responses.

### 🧠 Retrieval-Augmented Generation

* Documents are divided into smaller text chunks.
* Text chunks are converted into vector embeddings.
* FAISS stores and searches the embeddings.
* Relevant content is retrieved before generating an answer.

### 📝 Quiz Generation

* Generate quizzes based on uploaded study materials.
* Evaluate quiz answers.

### ❓ Practice Questions

* Generate practice questions for self-study.
* Questions are generated based on the selected study content.

### 🗂️ Knowledge Base

* Build a searchable knowledge base from uploaded documents.
* Uses FAISS as the vector store.

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      Frontend        │
                    │   HTML / CSS / JS    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      FastAPI         │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌────────────┐  ┌────────────┐  ┌────────────┐
        │ Document   │  │    RAG     │  │  Gemini AI │
        │ Processing │  │  Pipeline  │  │    (LLM)   │
        └────────────┘  └─────┬──────┘  └────────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │    FAISS    │
                       │Vector Store │
                       └─────────────┘
```

---

## 🔄 How RAG Works

The application follows these main steps:

```text
Upload Document
       ↓
Extract Text
       ↓
Split Text into Chunks
       ↓
Generate Embeddings
       ↓
Store Embeddings in FAISS
       ↓
User Asks a Question
       ↓
Convert Question into Embedding
       ↓
Retrieve Relevant Chunks
       ↓
Send Context + Question to Gemini
       ↓
Generate Context-Aware Answer
```

This approach allows the AI assistant to generate responses based on the user's uploaded study materials rather than relying only on general knowledge.

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* Lucide Icons

### Backend

* Python
* FastAPI
* Uvicorn

### AI / LLM

* Google Gemini

### Embeddings

* Sentence Transformers
* `all-MiniLM-L6-v2`

### Vector Database

* FAISS

### Document Processing

* PyPDF2
* docx2txt

---

## 📁 Project Structure

```text
void-edu-ai-learning-assistant/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── chat.py
│   │   ├── documents.py
│   │   ├── health.py
│   │   ├── knowledge_base.py
│   │   ├── questions.py
│   │   └── quiz.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── gemini_client.py
│   │   └── prompts.py
│   │
│   ├── models/
│   │
│   ├── services/
│   │   ├── chunker.py
│   │   ├── document_loader.py
│   │   ├── embedder.py
│   │   ├── question_gen.py
│   │   ├── quiz_eval.py
│   │   ├── rag.py
│   │   └── retriever.py
│   │
│   └── utils/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── storage/
│   ├── faiss/
│   └── uploads/
│
├── requirements.txt
├── run.sh
├── run.ps1
├── run.bat
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have:

* Python 3.10+
* Git
* Google Gemini API key

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/chaitu-pixel/void-edu-ai-learning-assistant.git
```

### 2. Navigate to the project

```bash
cd void-edu-ai-learning-assistant
```

### 3. Create a virtual environment

```bash
python -m venv venv
```

### 4. Activate the virtual environment

**Windows:**

```bash
venv\Scripts\activate
```

**Linux/macOS:**

```bash
source venv/bin/activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** Never commit your actual API key to GitHub.

---

## ▶️ Running the Application

### Windows

You can use:

```bash
run.bat
```

or:

```bash
.\run.ps1
```

### Linux/macOS

```bash
chmod +x run.sh
./run.sh
```

### Manual Start

Start the FastAPI backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

In another terminal, start the frontend:

```bash
cd frontend
python -m http.server 3000
```

Open:

```text
Frontend:
http://localhost:3000

API Documentation:
http://localhost:8000/docs
```

---

## 🔌 API Endpoints

| Endpoint                  | Method | Description                 |
| ------------------------- | ------ | --------------------------- |
| `/health`                 | GET    | Check API health            |
| `/api/upload`             | POST   | Upload study documents      |
| `/api/kb/build`           | POST   | Build knowledge base        |
| `/api/chat`               | POST   | Chat with AI                |
| `/api/quiz/generate`      | POST   | Generate quiz               |
| `/api/quiz/evaluate`      | POST   | Evaluate quiz               |
| `/api/questions/generate` | POST   | Generate practice questions |

---

## 📚 How to Use

### 1. Upload Study Materials

Upload your PDF, DOCX, or TXT files through the document upload section.

### 2. Build Knowledge Base

Build the knowledge base so that the uploaded content can be converted into embeddings and stored in FAISS.

### 3. Ask Questions

Open the Chat section and ask questions related to your uploaded materials.

### 4. Generate Quizzes

Select a topic and generate an AI-powered quiz for practice.

### 5. Generate Practice Questions

Generate additional questions to test your understanding of the study material.

---

## 👨‍💻 My Contribution

As part of this academic team project, I contributed to the development of the application across the major components of the system.

### Frontend

* Developed the user interface using HTML, CSS, and JavaScript.
* Implemented document upload, chat, quiz, and question-generation interfaces.
* Connected frontend functionality with backend APIs.

### Backend

* Worked with FastAPI to implement and integrate API endpoints.
* Handled communication between the frontend, RAG pipeline, and AI services.

### AI & RAG

* Worked on the RAG pipeline for retrieving relevant information from uploaded documents.
* Integrated text embeddings and FAISS vector search.
* Integrated Google Gemini for AI-generated responses.

### Document Processing

* Worked with PDF, DOCX, and TXT document processing.
* Implemented text extraction and chunking workflows.

### Learning Features

* Worked on quiz generation and evaluation.
* Worked on practice-question generation.

### Testing & Debugging

* Tested application functionality across different components.
* Debugged frontend, backend, API, and integration issues.

---

## 🎯 Key Learning Outcomes

Through this project, I gained practical experience with:

* Retrieval-Augmented Generation (RAG)
* Large Language Model integration
* Vector databases and semantic search
* FastAPI backend development
* REST API integration
* Document processing
* Text embeddings
* Frontend and backend integration
* AI-powered application development
* Debugging and application testing

---

## 👥 Project Type

**Academic Team Project**

This project was developed as part of an academic project with team members.

---

## 📄 License

This project is licensed under the MIT License.
