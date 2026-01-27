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

echo.
echo 2. Esperando a que el servidor arranque (5 segundos)...
timeout /t 5 >nul

echo.
echo 3. Abriendo ventana PROFESOR (Modo Normal)...
:: Abre en el navegador predeterminado (normalmente usaras este para el profe)
start http://localhost:4173/

echo.
echo 4. Abriendo ventana ALUMNO (Modo Incógnito)...
:: Intenta abrir con Chrome Incognito, si falla intenta Edge InPrivate
start chrome --incognito http://localhost:4173/ 2>nul
if %errorlevel% neq 0 (
    start msedge -inprivate http://localhost:4173/
)

echo.
echo ==========================================
echo    ¡LISTO!
echo    - Ventana Normal: Úsala como PROFESOR
echo    - Ventana Incógnito: Úsala como ALUMNO
echo ==========================================
echo.
pause
