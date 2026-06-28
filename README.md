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

## Deployment (Render + Vercel)

The backend (Django) deploys to **Render**; the frontend (React) deploys to **Vercel**.

### Prerequisite: hosted MongoDB

`localhost` MongoDB doesn't exist in the cloud. Create a free **MongoDB Atlas** M0
cluster, add a database user, allow access from anywhere (`0.0.0.0/0`), and copy the
`mongodb+srv://…` connection string — you'll set it as `MONGODB_HOST` on Render.

### 1. Backend → Render

A `render.yaml` blueprint is committed at the repo root, so:

1. Push to GitHub, then in Render: **New → Blueprint** → select this repo.
2. Render reads `render.yaml` (root dir `backend/`, Python build/start commands,
   `SECRET_KEY` auto-generated). When prompted, fill the secret env vars:
   - `MONGODB_HOST` — your Atlas connection string
   - `GROQ_API_KEY` — from https://console.groq.com
   - `CORS_ALLOWED_ORIGINS` — your Vercel URL (e.g. `https://your-app.vercel.app`)
   - `CSRF_TRUSTED_ORIGINS` — same Vercel URL (+ `https://*.onrender.com`)
3. Deploy. You'll get `https://your-app.onrender.com`. Verify `…/api/health/`.

> **Prefer the dashboard?** New → Web Service → Root Directory `backend`,
> Build `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`,
> Start `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`, and add the same env vars
> (set `DEBUG=False`, `ALLOWED_HOSTS=.onrender.com`, `PYTHON_VERSION=3.12.7`).

### 2. Frontend → Vercel

1. In Vercel: **New Project** → select this repo → set **Root Directory = `frontend`**
   (Vite is auto-detected; `vercel.json` already handles SPA routing).
2. Add env var `VITE_API_BASE_URL=https://your-app.onrender.com` (your Render URL).
3. Deploy, then copy the resulting Vercel URL back into Render's `CORS_ALLOWED_ORIGINS`
   / `CSRF_TRUSTED_ORIGINS` and redeploy the backend.

### ⚠️ Free-tier caveats

- **Cold starts:** Render free services sleep after ~15 min idle; the first request
  can take 30–60 s while it wakes and lazy-loads the embedding model.
- **Memory:** Sentence-Transformers + Torch + FAISS is heavy for the 512 MB free
  instance and can occasionally OOM. If you hit restarts, upgrade the Render plan.
- **Ephemeral disk:** SQLite users, uploaded files, and FAISS indexes are **wiped on
  each deploy/restart** on the free tier. Only MongoDB (Atlas) persists. Add a paid
  Render Disk + `VOLUME_PATH` to keep `media/` and `indexes/` (see `.env.example`).
