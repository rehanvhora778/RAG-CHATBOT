# AI RAG Chatbot

A full-stack Retrieval-Augmented Generation chatbot: upload documents (PDF / DOCX / TXT),
then chat with an AI that answers **grounded in your files** with inline citations.

**Stack:** Django REST Framework · MongoDB · FAISS (vector search) ·
Sentence-Transformers embeddings · Groq (Llama 3.3 70B) · React + Vite + Tailwind

## Project structure

```
.
├── backend/            Django API (Python)
│   ├── apps/           authentication, documents, chat, analytics, admin_panel
│   ├── config/         settings, urls, wsgi/asgi
│   ├── core/           Mongo client, shared utils, responses, permissions
│   ├── services/       RAG pipeline, embeddings, FAISS store, chunker, LLM, extractor
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env            secrets — not committed (copy from .env.example)
│   ├── db.sqlite3      Django auth/JWT only (project data lives in MongoDB)
│   ├── media/          uploaded files        (auto-created, gitignored)
│   └── indexes/        per-user FAISS indexes (auto-created, gitignored)
├── frontend/           React + Vite single-page app
├── venv/               Python virtual environment (gitignored)
├── run_backend.bat     start the API   (http://localhost:8000)
└── run_frontend.bat    start the UI    (http://localhost:3000)
```

## Prerequisites

- Python 3.11, Node.js 18+
- **MongoDB** running on `localhost:27017`
- A `GROQ_API_KEY` in `backend/.env` (copy `backend/.env.example` → `backend/.env`)

## Run (Windows)

1. Make sure MongoDB is running.
2. Double-click **`run_backend.bat`** — activates the venv, then starts Django on port 8000.
3. Double-click **`run_frontend.bat`** — starts the Vite dev server on port 3000.
4. Open http://localhost:3000

### Manual equivalent

```bat
:: Backend
call venv\Scripts\activate
cd backend
python manage.py runserver

:: Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## First-time setup

```bat
python -m venv venv
call venv\Scripts\activate
pip install -r backend\requirements.txt
copy backend\.env.example backend\.env   :: then edit and add GROQ_API_KEY
cd backend && python manage.py migrate && python manage.py createsuperuser

cd ..\frontend && npm install
```
