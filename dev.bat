@echo off
cd /d "%~dp0"
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Встановлюємо Vercel CLI...
    npm install -g vercel
)
cmd /k vercel dev
