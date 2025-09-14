@echo off
chcp 65001 >nul
cd /d "C:\Users\tomon\dev\projects\SLM_Server"
echo Fortune占いシステム用のローカルサーバーを起動します...
echo ブラウザで http://localhost:8000 にアクセスしてください
echo.
python -m http.server 8000 --bind 0.0.0.0
pause