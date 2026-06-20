@echo off
echo ========================================
echo  AI RAG Chatbot - Frontend Setup
echo ========================================

echo.
echo [1/3] Moving to frontend directory...
cd frontend

echo.
echo [2/3] Installing Node.js dependencies...
npm install

echo.
echo [3/3] Creating frontend .env file...
if not exist .env (
    copy .env.example .env
    echo frontend/.env created.
) else (
    echo frontend/.env already exists, skipping.
)

echo.
echo ========================================
echo  Frontend Setup Complete!
echo ========================================
echo.
echo To start the frontend dev server:
echo   cd frontend
echo   npm run dev
echo.
pause
