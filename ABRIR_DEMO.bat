@echo off
chcp 65001 >nul
echo ==========================================
echo    INICIANDO DASHBOARD DOCENTE Y FEEDBACK
echo ==========================================
echo.
echo 1. Actualizando sistema (npm run build)...
call npm run build

echo.
echo 2. Arrancando servidor...
:: Inicia el servidor en una ventana nueva minimizada para no molestar
start "Servidor Dashboard" /min cmd /k "npm run preview"

echo 2. Esperando a que el servidor arranque (20 segundos)...
timeout /t 20

echo.
echo 3. Abriendo ventana PROFESOR...
start "" "http://localhost:4173/?v=%RANDOM%"

echo.


echo.
echo ==========================================
echo    ¡LISTO!
echo    - Ventana Normal: Úsala como PROFESOR
echo    - Ventana Incógnito: Úsala como ALUMNO
echo ==========================================
echo.
pause
