@echo off
echo ========================================
echo  Starting AI RAG Chatbot - FRONTEND
echo ========================================
echo.
echo Frontend will run at http://localhost:3000
echo (Keep the backend running in its own window)
echo.
cd /d "%~dp0frontend"
npm run dev
pause
