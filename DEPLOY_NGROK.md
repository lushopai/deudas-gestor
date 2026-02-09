# Deploy con ngrok (Plan Free - 1 túnel)

## Resumen
Esta configuración permite servir **frontend y backend en un solo puerto** (9150), ideal para el plan free de ngrok que solo permite 1 túnel.

## Arquitectura
```
ngrok (https://xxxxx.ngrok-free.app)
  ↓
Spring Boot :9150
  ├── /api/* → Backend REST API
  └── /* → Frontend Angular (archivos estáticos)
```

## Pasos para desplegar

### 1. Ejecutar el script de deploy

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

Este script:
- ✅ Construye el frontend Angular con configuración de producción
- ✅ Copia los archivos estáticos al backend (`src/main/resources/static`)
- ✅ Construye el JAR del backend con el frontend incluido

### 2. Iniciar el backend

**Opción A - Con Maven:**
```bash
cd gastos-compartidos
mvnw spring-boot:run
```

**Opción B - Con el JAR:**
```bash
cd gastos-compartidos
java -jar target/gastos-compartidos-0.0.1-SNAPSHOT.jar
```

El servidor estará en: `http://localhost:9150`

### 3. Crear el túnel de ngrok

En otra terminal:
```bash
ngrok http 9150
```

Obtendrás una URL como: `https://5d5aa57f78dc.ngrok-free.app`

### 4. Probar

Abre la URL de ngrok en el navegador. Deberías ver:
- Frontend Angular en: `https://xxxxx.ngrok-free.app/`
- Backend API en: `https://xxxxx.ngrok-free.app/api/...`

## Cambios realizados

### Frontend
- ✅ `environment.prod.ts`: Usa ruta relativa `/api` en lugar de URL absoluta
- ✅ El frontend ahora hace llamadas a `/api` en el mismo dominio

### Backend
- ✅ `SecurityConfig.java`: Permite acceso a archivos estáticos (/, /assets/*, etc.)
- ✅ `WebConfig.java`: Configura SPA routing (forward rutas no-API a index.html)

## Troubleshooting

### El frontend no carga
- Verifica que los archivos estén en `gastos-compartidos/src/main/resources/static/`
- Revisa que el JAR se haya construido después de copiar los archivos

### Error 404 en rutas del frontend
- Asegúrate de que `WebConfig.java` esté configurado correctamente
- Spring debe hacer forward a `index.html` para rutas como `/dashboard`, `/perfil`, etc.

### El API no responde
- Verifica que el backend esté corriendo en el puerto 9150
- Revisa los logs: las llamadas a `/api/*` deben llegar al backend

### CORS errors
- No debería haber problemas de CORS ya que frontend y backend están en el mismo dominio
- Si aparecen, revisa `SecurityConfig.java` (CORS config)

## Desarrollo local

Para desarrollo local (sin ngrok):
```bash
# Terminal 1 - Backend
cd gastos-compartidos
mvnw spring-boot:run

# Terminal 2 - Frontend
cd gastos-compartidos-front
ng serve
```

Accede a `http://localhost:4200` (usa `environment.ts`, no `environment.prod.ts`)
