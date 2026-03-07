@echo off
title Ekklesia Control

echo Iniciando Backend...
start "Ekklesia Backend" /D "%~dp0backend" cmd /k "node index.js"

echo Aguardando backend...
timeout /t 3 /noisy >nul

echo Iniciando Frontend...
start "Ekklesia Frontend" /D "%~dp0frontend" cmd /k "npx next dev"

echo Aguardando frontend...
timeout /t 8 /noisy >nul

start http://localhost:3000
echo.
echo Sistema iniciado! Pode fechar esta janela.
pause
