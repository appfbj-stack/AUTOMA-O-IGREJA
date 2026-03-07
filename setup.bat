@echo off
echo ====================================
echo  Ekklesia Control - Setup Inicial
echo ====================================
echo.

echo [1/4] Instalando dependencias do Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERRO ao instalar backend!
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias do Frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERRO ao instalar frontend!
    pause
    exit /b 1
)

echo.
echo [3/4] Gerando icones PWA (placeholder)...
cd ..
if not exist "frontend\public\icons" mkdir "frontend\public\icons"
echo SVG icon criado. Para PWA completo, gere PNG 192x192 e 512x512 em frontend\public\icons\

echo.
echo [4/4] Setup concluido!
echo.
echo Para iniciar o sistema:
echo   Terminal 1: cd backend ^& node index.js
echo   Terminal 2: cd frontend ^& npm run dev
echo.
echo Acesse: http://localhost:3000
echo Login: admin / ekklesia2024
echo.
pause
