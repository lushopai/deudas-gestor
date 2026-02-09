@echo off
echo ================================================
echo  Construyendo frontend Angular con produccion
echo ================================================

cd gastos-compartidos-front
call npm run build -- --configuration production

echo.
echo ================================================
echo  Copiando archivos al backend (src/main/resources/static)
echo ================================================

cd ..
rmdir /s /q gastos-compartidos\src\main\resources\static 2>nul
mkdir gastos-compartidos\src\main\resources\static

xcopy /E /I /Y gastos-compartidos-front\dist\gastos-compartidos-front\browser\* gastos-compartidos\src\main\resources\static\

echo.
echo ================================================
echo  Construyendo backend Spring Boot
echo ================================================

cd gastos-compartidos
call mvnw clean package -DskipTests

echo.
echo ================================================
echo  DEPLOY COMPLETADO!
echo ================================================
echo.
echo Ahora puedes:
echo 1. Ejecutar el JAR: java -jar target\gastos-compartidos-0.0.1-SNAPSHOT.jar
echo 2. O ejecutar con Maven: mvnw spring-boot:run
echo 3. Apuntar ngrok al puerto 9150: ngrok http 9150
echo.
echo La aplicacion estara disponible en: http://localhost:9150
pause
