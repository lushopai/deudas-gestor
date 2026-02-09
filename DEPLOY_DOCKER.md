# Deploy con Docker + Nginx + ngrok

## Arquitectura

```
ngrok (https://xxxxx.ngrok-free.app)
  ↓
nginx:80 (reverse proxy)
  ├── /api/* → backend:8080 (Spring Boot)
  └── /* → frontend:80 (Angular + nginx)
```

**Ventaja:** Un solo puerto (80) expuesto = Compatible con ngrok free (1 túnel)

## Archivos importantes

- `docker-compose.yml` - Orquesta los 3 servicios (nginx, backend, frontend)
- `nginx.conf` - Configuración del reverse proxy
- `gastos-compartidos/Dockerfile` - Build del backend
- `gastos-compartidos-front/Dockerfile` - Build del frontend

## Pasos para levantar

### 1. Configurar variables de entorno (opcional)

Crea un archivo `.env` en la raíz del proyecto:

```bash
JWT_SECRET=tu_secret_jwt_super_largo_y_seguro_aqui
GOOGLE_CLIENT_ID=412131551809-ipbsdonp0927n7dgq6vnut05d67posda.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_google_secret
CLOUDFLARE_API_TOKEN=tu_cloudflare_token
```

### 2. Construir y levantar los contenedores

```bash
docker-compose up --build -d
```

Esto:
- ✅ Construye el backend (Spring Boot)
- ✅ Construye el frontend (Angular)
- ✅ Levanta nginx como reverse proxy
- ✅ Todo disponible en: `http://localhost`

### 3. Verificar que funciona localmente

Abre el navegador en: `http://localhost`

- Frontend: `http://localhost/`
- API: `http://localhost/api/...`

### 4. Exponer con ngrok

En otra terminal:

```bash
ngrok http 80
```

Obtendrás una URL como: `https://5d5aa57f78dc.ngrok-free.app`

Ahora tu app completa (frontend + backend) está disponible públicamente en esa URL.

## Comandos útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Detener todo
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir solo el backend
docker-compose up -d --build backend

# Reconstruir solo el frontend
docker-compose up -d --build frontend

# Ver estado de los contenedores
docker-compose ps
```

## Desarrollo local (sin Docker)

Si quieres desarrollar sin Docker:

**Terminal 1 - Backend:**
```bash
cd gastos-compartidos
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd gastos-compartidos-front
ng serve
```

**Terminal 3 - Nginx (si quieres probar el proxy localmente):**
```bash
docker-compose up nginx
```

Accede a: `http://localhost:4200` (desarrollo directo) o `http://localhost` (a través del proxy)

## Troubleshooting

### Los contenedores no inician

```bash
# Ver qué falló
docker-compose logs

# Revisar que los puertos no estén ocupados
netstat -ano | findstr :80
```

### El frontend no conecta con el backend

1. Verifica que nginx esté corriendo: `docker-compose ps`
2. Revisa los logs de nginx: `docker-compose logs nginx`
3. Verifica que el backend esté respondiendo: `docker-compose logs backend`

### Cambios en el código no se reflejan

```bash
# Reconstruir los contenedores
docker-compose up --build -d
```

### ngrok muestra error

- Asegúrate de que el puerto 80 esté libre antes de iniciar Docker Compose
- En Windows, a veces hay que correr ngrok con privilegios de administrador

## Para producción (servidor Ubuntu + Jenkins)

1. **Jenkinsfile** (crear pipeline que ejecute):
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

2. **Variables de entorno en Jenkins:**
   - Configurar JWT_SECRET, GOOGLE_CLIENT_ID, etc. como secrets en Jenkins
   - Se inyectarán automáticamente al docker-compose

3. **Sin ngrok en producción:**
   - Configura un dominio real apuntando a tu servidor
   - Usa nginx o Traefik con Let's Encrypt para HTTPS
   - No necesitas ngrok si tienes IP pública

## Diferencias con DEPLOY_NGROK.md

- **DEPLOY_NGROK.md:** Frontend servido por Spring Boot (todo en 1 JAR)
- **DEPLOY_DOCKER.md (este):** Servicios separados + nginx proxy (más escalable)

Ambos funcionan con ngrok free (1 túnel), elige el que prefieras según tu caso de uso.
