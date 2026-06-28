@echo off
echo ========================================
echo  Starting AI RAG Chatbot - BACKEND
echo ========================================
echo.
echo Make sure MongoDB is running on localhost:27017
echo Backend will run at http://localhost:8000
echo.
call "%~dp0venv\Scripts\activate"
cd /d "%~dp0backend"
python manage.py runserver
pause
