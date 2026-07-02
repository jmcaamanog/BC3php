@echo off
title Servidor Local BC3 Viewer
echo ===================================================
echo   Iniciando BC3 Viewer Premium
echo ===================================================
echo.
echo [1/2] Iniciando servidor web PHP en http://localhost:8080 ...
start /b php -S localhost:8080
echo.
echo [2/2] Abriendo el navegador en http://localhost:8080 ...
timeout /t 1 /nobreak >nul
start "" "http://localhost:8080"
echo.
echo Servidor en ejecucion. Para detenerlo, cierra esta ventana.
echo ===================================================
pause
