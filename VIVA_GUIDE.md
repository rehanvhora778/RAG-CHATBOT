# Viva Guide — AI RAG Chatbot (Simple Explanation)

A cheat-sheet for explaining this project in your viva. Plain language, short answers.

---

## 1. What is this project? (one line)

> A web app where a user uploads their own documents (PDF, Word, or text) and then
> **chats with an AI that answers only from those documents** — with references to the exact page.

Think of it as **ChatGPT, but it can only use YOUR files** — not the whole internet.

---

## 2. What problem does it solve?

- Normal AI chatbots (like ChatGPT) answer from general knowledge and can **make things up** ("hallucinate").
- Reading a 200-page document to find one answer is slow.
- **My project fixes both:** the AI reads the user's documents for them and answers questions **grounded in the real text**, so the answer is trustworthy and comes with a page reference.

---

## 3. What is "RAG"? (the key term — examiners always ask)

**RAG = Retrieval-Augmented Generation.**

Break it into 3 words:
- **Retrieval** → first *find* the most relevant pieces of text from the documents.
- **Augmented** → *add* those pieces to the AI's prompt as context.
- **Generation** → the AI *writes* an answer using only that context.

**Simple analogy:** It's like an **open-book exam**. The AI is not allowed to answer from memory. It must first find the right paragraph in the book, then explain it in its own words.

---

## 4. How it works — the full journey (6 steps)

**A. Upload**
User uploads a file → we save the file and record its details in the database → processing starts in the background (so the user isn't stuck waiting).

**B. Extract text**
We read the text out of the PDF/Word/TXT. If a PDF is a scanned image (no real text), we use **OCR** (an AI vision model) to read the picture.

**C. Chunk (split into small pieces)**
A big document is split into small passages (~900 characters each). Small focused pieces = better, more accurate answers, and we can point to exactly where an answer came from.

**D. Embed (turn text into numbers)**
Each chunk is converted into a list of numbers called an **embedding** — a "fingerprint of meaning." Similar meanings get similar numbers.

**E. Store**
- The chunk **text** goes into **MongoDB**.
- The chunk **numbers (vectors)** go into **FAISS**, a super-fast search index.

**F. Ask a question (chat)**
1. Turn the user's question into numbers (same embedding model).
2. Use FAISS to find the chunks whose numbers are **closest** to the question.
3. Send those chunks + the question to the AI (Groq / Llama 3.3 70B).
4. The AI writes an answer **using only those chunks**, and we show the **source page** as a citation.
5. If nothing relevant is found, it honestly says *"I couldn't find this in your documents"* instead of guessing.

---

## 5. Tech stack — in plain English

| Part | Tool | Why (simple) |
|------|------|--------------|
| Backend (server) | **Django + Django REST Framework** | Handles logins, uploads, and the chat API |
| Frontend (website) | **React + Vite + Tailwind** | The pages the user clicks through |
| Main database | **MongoDB** | Stores documents, chunks, chats, messages |
| User accounts | **SQLite + JWT** | Login/signup; JWT is the "digital ID card" that proves who you are on each request |
| Turn text into numbers | **Sentence-Transformers (MiniLM)** | Creates the meaning-fingerprints (embeddings) |
| Fast similarity search | **FAISS** | Finds the closest chunks instantly |
| The AI that writes answers | **Groq API (Llama 3.3 70B)** | Generates the final answer from the context |
| OCR for scanned pages | **Groq Vision (Llama 4)** | Reads text from image-based PDF pages |

---

## 6. Project structure (what's where)

```
backend/     → the server (Python / Django)
  apps/      → features: authentication, documents, chat, analytics, admin_panel
  services/  → the "brain": text extraction, chunking, embeddings, FAISS, the LLM, RAG pipeline
  core/      → shared helpers (MongoDB connection, responses)
frontend/    → the website (React): Login, Dashboard, Documents, Chat, Analytics pages
```

---

## 7. Key terms — quick definitions (memorize these)

- **Embedding** → text turned into a list of numbers that represents its *meaning*.
- **Vector** → that list of numbers.
- **Chunk** → a small passage of a document (~900 characters).
- **FAISS** → a library that searches those number-vectors very fast to find the most similar ones.
- **Cosine similarity** → how we measure if two vectors (meanings) are "close." Closer = more related.
- **MMR (Maximum Marginal Relevance)** → picks chunks that are relevant *and* different from each other, so the AI doesn't get 4 copies of the same paragraph.
- **JWT (JSON Web Token)** → a secure token the user gets after login; sent with every request to prove identity.
- **Grounding** → forcing the AI to answer only from the given context, not its own memory (this prevents hallucination).
- **OCR** → reading text from an image.

---

## 8. Likely viva questions + simple answers

**Q: What is RAG and why did you use it?**
A: Retrieval-Augmented Generation. I use it so the AI answers from the user's actual documents instead of guessing, which makes answers accurate and trustworthy.

**Q: How does the chatbot avoid making up answers (hallucinating)?**
A: Two ways. (1) I only give it the relevant chunks from the documents as context. (2) The prompt strictly tells it to answer *only* from that context, and if the answer isn't there, to say it couldn't find it. There's also a similarity threshold — if no chunk is relevant enough, we refuse instead of forcing an answer.

**Q: Why do you split documents into chunks?**
A: Because searching and answering work better on small, focused pieces. It also lets me cite the exact page an answer came from. A whole 200-page document in one piece would be too big and unfocused.

**Q: What is an embedding?**
A: A way to turn text into numbers that capture its meaning, so the computer can measure which texts are similar in meaning — not just matching keywords.

**Q: What is FAISS and why not just search the database normally?**
A: FAISS is built to search millions of number-vectors extremely fast to find the closest ones. A normal database search matches words, not *meaning*. FAISS matches meaning.

**Q: Why MongoDB and not SQL for the main data?**
A: Documents, chunks, and chat messages have flexible, nested shapes and grow a lot — MongoDB (a NoSQL document database) fits that naturally. I still use SQLite for user accounts because Django's login system uses it.

**Q: What LLM do you use and why Groq?**
A: Llama 3.3 70B through the Groq API. Groq is very fast and has a free tier, which suited the project.

**Q: How do you handle scanned/image PDFs?**
A: If a page has no real text, I render it to an image and use an AI vision model (OCR) to read the text.

**Q: How is the user's data kept separate/secure?**
A: Login is protected with JWT tokens. Each user's documents and vector indexes are stored per-user, so users only see their own files.

**Q: What happens when a user asks something not in the documents?**
A: The system finds no relevant chunks (or none above the similarity threshold), so it replies that it couldn't find the answer in the uploaded documents — it does not make one up.

**Q: How did you make big PDFs process faster?**
A: I skip expensive table-detection unless needed, mark a document ready to chat as soon as it's indexed (the summary is generated after), embed in larger batches using all CPU cores, and OCR scanned pages in parallel instead of one by one.

---

## 9. How to run it (for the demo)

**Terminal 1 — backend:**
```bat
call venv\Scripts\activate
cd backend
python manage.py runserver
```

**Terminal 2 — frontend:**
```bat
cd frontend
npm run dev
```

Then open **http://localhost:3000**. (MongoDB must be running first.)

---

## 10. One-paragraph summary (say this if asked "explain your project")

> "My project is an AI document chatbot built with RAG. A user logs in and uploads their
> documents. The system extracts the text, splits it into small chunks, and converts each
> chunk into a meaning-based numeric vector using an embedding model, storing the text in
> MongoDB and the vectors in a FAISS index. When the user asks a question, I convert the
> question into a vector too, use FAISS to retrieve the most relevant chunks, and send them
> with the question to a large language model (Llama 3.3 via Groq). The model answers using
> only those chunks and cites the source page. If the answer isn't in the documents, it says
> so instead of guessing. The frontend is built in React."
