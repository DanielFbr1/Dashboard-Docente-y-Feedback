@echo off
cls
color 0B
echo ==========================================
echo   AI TICO - MODO ONLINE (CLASE)
echo ==========================================
echo.
echo [PASO 1] Actualizando y arrancando servidor...
call npm run build
start "AI Tico Server - NO CERRAR" cmd /c "npm run preview"
echo Servidor iniciado en segundo plano.
echo.
echo [PASO 2] Conectando con internet para crear enlace publico...
echo.
echo -----------------------------------------------------------------------
echo  INSTRUCCIONES:
echo  1. Espera a que aparezca un texto abajo que dice "tunneled with tls".
echo  2. Veras una direccion web parecida a: https://algo-raro.localhost.run
echo  3. COPIA ESA DIRECCION.
echo  4. Enviala o escribela en el ordenador de clase.
echo -----------------------------------------------------------------------
echo.
echo Conectando... (Si te pide confirmar, escribe 'yes')
echo.
ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run
echo.
echo Si el programa se ha cerrado, vuelve a ejecutarlo.
pause
