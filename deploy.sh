#!/bin/bash

echo "================================================"
echo " Construyendo frontend Angular con producción"
echo "================================================"

cd gastos-compartidos-front
npm run build -- --configuration production

echo ""
echo "================================================"
echo " Copiando archivos al backend (src/main/resources/static)"
echo "================================================"

cd ..
rm -rf gastos-compartidos/src/main/resources/static
mkdir -p gastos-compartidos/src/main/resources/static

cp -r gastos-compartidos-front/dist/gastos-compartidos-front/browser/* gastos-compartidos/src/main/resources/static/

echo ""
echo "================================================"
echo " Construyendo backend Spring Boot"
echo "================================================"

cd gastos-compartidos
./mvnw clean package -DskipTests

echo ""
echo "================================================"
echo " DEPLOY COMPLETADO!"
echo "================================================"
echo ""
echo "Ahora puedes:"
echo "1. Ejecutar el JAR: java -jar target/gastos-compartidos-0.0.1-SNAPSHOT.jar"
echo "2. O ejecutar con Maven: ./mvnw spring-boot:run"
echo "3. Apuntar ngrok al puerto 9150: ngrok http 9150"
echo ""
echo "La aplicación estará disponible en: http://localhost:9150"
