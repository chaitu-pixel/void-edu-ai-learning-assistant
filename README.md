# Void Edu - AI Learning Assistant

An AI-powered educational chatbot that uses RAG (Retrieval-Augmented Generation) to answer questions from your study materials.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-green)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)

## Features

- **Document Upload**: Upload PDF, DOCX, or TXT files as study materials
- **AI Chat**: Ask questions and get contextual answers from your documents
- **Quiz Generation**: Auto-generate quizzes based on topics from your materials
- **Question Generation**: Generate practice questions for self-study
- **Knowledge Base**: Build and manage a vector database of your documents

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│   FastAPI       │────▶│  Gemini AI      │
│  (HTML/CSS/JS)  │     │   Backend       │     │  (LLM)          │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   FAISS Index   │
                        │ (Vector Store)  │
                        └─────────────────┘
```

## Tech Stack

- **Backend**: FastAPI, Uvicorn
- **AI/LLM**: Google Gemini (gemma-3-1b-it)
- **Embeddings**: Sentence Transformers (all-MiniLM-L6-v2)
- **Vector Store**: FAISS
- **Document Processing**: PyPDF2, docx2txt
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Lucide Icons

## Prerequisites

- Python 3.10 or higher
- Google Gemini API key

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/void-education.git
   cd void-education
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Running the Application

### Quick Start (Windows)

**Option 1: Batch file**
```cmd
run.bat
```

**Option 2: PowerShell**
```powershell
.\run.ps1
```

### Quick Start (Linux/macOS)

```bash
chmod +x run.sh
./run.sh
```

### Manual Start

1. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend server** (in a new terminal)
   ```bash
   cd frontend
   python -m http.server 3000
   ```

3. **Open your browser**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/upload` | POST | Upload documents |
| `/api/kb/build` | POST | Build knowledge base |
| `/api/chat` | POST | Chat with AI |
| `/api/quiz/generate` | POST | Generate quiz |
| `/api/quiz/evaluate` | POST | Evaluate quiz answers |
| `/api/questions/generate` | POST | Generate questions |

## Project Structure

```
void-education/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── api/                  # API route handlers
│   │   ├── chat.py          # Chat endpoint
│   │   ├── documents.py     # Document upload
│   │   ├── health.py        # Health check
│   │   ├── knowledge_base.py # KB management
│   │   ├── questions.py     # Question generation
│   │   └── quiz.py          # Quiz endpoints
│   ├── core/                 # Core utilities
│   │   ├── config.py        # Configuration
│   │   ├── gemini_client.py # Gemini API client
│   │   └── prompts.py       # LLM prompts
│   ├── models/               # Pydantic models
│   ├── services/             # Business logic
│   │   ├── chunker.py       # Text chunking
│   │   ├── document_loader.py # Document parsing
│   │   ├── embedder.py      # Text embeddings
│   │   ├── question_gen.py  # Question generation
│   │   ├── quiz_eval.py     # Quiz evaluation
│   │   ├── rag.py           # RAG pipeline
│   │   └── retriever.py     # Vector retrieval
│   └── utils/                # Helper utilities
├── frontend/                 # Web interface
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── storage/                  # Data storage
│   ├── faiss/               # Vector index
│   └── uploads/             # Uploaded files
├── requirements.txt
├── run.sh
└── README.md
```

## Usage

1. **Upload Documents**: Go to the Upload tab and drag-drop your study materials
2. **Build Knowledge Base**: Click "Build Knowledge Base" after uploading
3. **Ask Questions**: Switch to Chat and ask questions about your documents
4. **Generate Quiz**: Go to Quiz tab, enter a topic, and generate practice quizzes
5. **Practice Questions**: Use Questions tab to generate study questions

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
