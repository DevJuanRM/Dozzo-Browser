@echo off
setlocal enabledelayedexpansion
title Lanzar Nueva Version de Dozzo Browser
cd /d "%~dp0"

echo ==========================================================
echo       PUBLICADOR DE NUEVAS VERSIONES - DOZZO BROWSER
echo ==========================================================
echo.
echo Version actual en el proyecto:
node -e "console.log(' -> v' + require('./package.json').version)"
echo.
echo Tipos de version recomendados:
echo   - Parches / Correcciones: 1.0.1, 1.0.2...
echo   - Nuevas funciones:       1.1.0, 1.2.0...
echo   - Grandes cambios:        2.0.0...
echo.
set /p NUEVA_VERSION="Escribe el nuevo numero de version (ej: 1.1.0): "

if "%NUEVA_VERSION%"=="" (
    echo.
    echo [ERROR] No escribiste ninguna version. Operacion cancelada.
    pause
    exit /b 1
)

echo.
echo ==========================================================
echo  1. Actualizando version en package.json a %NUEVA_VERSION%...
echo ==========================================================
node -e "let pkg=require('./package.json'); pkg.version='%NUEVA_VERSION%'; require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');"

echo.
echo ==========================================================
echo  2. Compilando instaladores (.exe) de Windows...
echo ==========================================================
call npm run dist
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Fallo la compilacion. Revisa los errores arriba.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================================
echo  3. Guardando cambios y creando etiqueta v%NUEVA_VERSION%...
echo ==========================================================
git add -A
git commit -m "chore(release): v%NUEVA_VERSION%"
git tag -f v%NUEVA_VERSION%

echo.
echo ==========================================================
echo  4. Subiendo codigo y version a GitHub...
echo ==========================================================
git push origin main
git push origin v%NUEVA_VERSION% --force

echo.
echo ==========================================================
echo  Listo! La version v%NUEVA_VERSION% ha sido publicada.
echo.
echo  Archivos creados en la carpeta /release:
echo   - Dozzo Browser Setup %NUEVA_VERSION%.exe
echo   - Dozzo Browser %NUEVA_VERSION%.exe
echo.
echo  Los usuarios existentes recibiran la actualizacion
echo  automatica en su navegador!
echo ==========================================================
pause
