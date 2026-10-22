@echo off
title Probar Dozzo Browser en PC (Modo Desarrollo)
cd /d "%~dp0"
echo ==============================================
echo    Iniciando Dozzo Browser en PC...
echo    Recarga automatica (Hot-Reload) activa!
echo    Presiona F5 o Ctrl+Shift+R para refrescar
echo ==============================================
echo.
npm run dev
pause
