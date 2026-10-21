@echo off
title Subir Dozzo Browser a GitHub
cd /d "%~dp0"
echo ==============================================
echo    Subiendo Dozzo Browser a GitHub...
echo ==============================================
echo.
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Hubo un problema al subir. Revisa tus credenciales de GitHub.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==============================================
echo    Creando y subiendo etiqueta de version v1.0.0...
echo ==============================================
git tag -f v1.0.0
git push origin v1.0.0 --force

echo.
echo ==============================================
echo    Listo! Todo el codigo y la version v1.0.0
echo    han sido subidos con exito a GitHub.
echo ==============================================
pause
