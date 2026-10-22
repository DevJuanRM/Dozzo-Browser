@echo off
title Probar Dozzo Browser en Celular (iPhone / Android)
cd /d "%~dp0"
echo ==============================================================
echo    Iniciando Servidor Local para Celular (Wi-Fi)
echo ==============================================================
echo.
echo    1. Asegurate de que tu iPhone o Android este conectado
echo       a la MISMA red Wi-Fi que esta computadora.
echo.
echo    2. Abre Safari (iPhone) o Chrome (Android) y entra a la
echo       direccion "Network" que saldra aqui abajo.
echo.
echo    3. Cualquier cambio que hagas en el codigo se vera
echo       EN VIVO en tu celular al instante sin hacer git push!
echo ==============================================================
echo.
npx vite --host 0.0.0.0 --port 5173
pause
