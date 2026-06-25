@echo off
echo ========================================
echo  Starting AI RAG Chatbot - BACKEND
echo ========================================
echo.
echo Make sure MongoDB is running on localhost:27017
echo Backend will run at http://localhost:8000
echo.
cd /d "%~dp0"
call venv\Scripts\activate
python manage.py runserver
pause
