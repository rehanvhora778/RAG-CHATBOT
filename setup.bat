@echo off
echo ========================================
echo  AI RAG Chatbot - Backend Setup
echo ========================================

echo.
echo [1/5] Creating virtual environment...
python -m venv venv

echo.
echo [2/5] Activating virtual environment...
call venv\Scripts\activate

echo.
echo [3/5] Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [4/5] Creating .env file from template...
if not exist .env (
    copy .env.example .env
    echo .env file created. PLEASE EDIT IT NOW with your API keys!
) else (
    echo .env already exists, skipping.
)

echo.
echo [5/5] Running Django migrations...
python manage.py migrate

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env and add your GEMINI_API_KEY
echo   2. Make sure MongoDB is running on localhost:27017
echo   3. Run: python manage.py createsuperuser
echo   4. Run: python manage.py runserver
echo.
pause
