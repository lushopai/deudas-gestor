# 🚀 PLAN DE IMPLEMENTACIÓN - PRODUCCIÓN CON NGROK (8 DÍAS)

## RESUMEN EJECUTIVO
Sin cambios de dominio (mantiene ngrok), implementar:
- **Backend**: Rate Limiting, Auditoría, Logging, Validación
- **Frontend**: Build prod, Security Headers  
- **Testing**: Load testing
- **Total**: 8 días de desarrollo

---

## FASE 1: FRONTEND (2 DÍAS)

### ✅ 1.1 COMPLETADO: environment.prod.ts
**Archivo**: `src/environments/environment.prod.ts`
- ✅ Ruta relativa `/api` (funciona en prod y desarrollo)
- ✅ Google Client ID para producción
- ✅ Logging configuration

### ✅ 1.2 COMPLETADO: Security Headers
**Archivo**: `src/index.html`
- ✅ X-Content-Type-Options
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ Content-Security-Policy
- ✅ Referrer Policy

### 1.3 BUILD PRODUCCIÓN (2 horas)
```bash
# Instalar dependencias (si es necesario)
npm install

# Build para producción
ng build --configuration production

# Output: dist/gastos-compartidos-front/

# Verificar tamaño (debe ser < 500KB gzip)
ls -lh dist/gastos-compartidos-front/
```

**Verify build**:
```bash
# Servir localmente para probar
npm install -g http-server
http-server dist/gastos-compartidos-front/ -p 4200
# Visita: http://localhost:4200
```

---

## FASE 2: BACKEND (5 DÍAS)

### 2.1 RATE LIMITING (1 DÍA)
**Usar**: Bucket4j (ya configurable con Spring)

**Pasos**:
1. Agregar dependencia en `pom.xml`:
```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>7.6.0</version>
</dependency>
```

2. Crear `RateLimitInterceptor.java` (ya existe, verifica):
```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private final Map<String, Bucket> userBuckets = new ConcurrentHashMap<>();
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String userId = getUserId(request); // Desde JWT
        String key = userId != null ? "user_" + userId : "ip_" + request.getRemoteAddr();
        
        Bucket bucket = userBuckets.computeIfAbsent(key, k -> {
            if (key.startsWith("user_")) {
                return RateLimitConfig.createUserBucket(); // 100/min
            } else if (request.getRequestURI().contains("/login")) {
                return RateLimitConfig.createLoginBucket(); // 5/min
            } else {
                return RateLimitConfig.createAnonymousBucket(); // 20/min
            }
        });
        
        if (!bucket.tryConsume(1)) {
            response.setStatus(429); // Too Many Requests
            response.getWriter().write("{\"error\":\"Too many requests\"}");
            return false;
        }
        return true;
    }
}
```

3. Registrar interceptor en `WebConfig.java`:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
    private RateLimitInterceptor rateLimitInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/public/**");
    }
}
```

---

### ✅ 2.2 AUDITORÍA (2 DÍAS) - COMPLETADO

**Crear tabla SQL**:
```sql
CREATE TABLE audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    accion VARCHAR(20),       -- CREATE, UPDATE, DELETE, LEER
    tabla_nombre VARCHAR(50), -- gastos, deudas, presupuestos
    registro_id BIGINT,
    datos_antes LONGTEXT,     -- JSON del estado anterior (UPDATE/DELETE)
    datos_despues LONGTEXT,   -- JSON del estado nuevo (CREATE/UPDATE)
    descripcion VARCHAR(255),
    ip_origen VARCHAR(45),
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_tabla (tabla_nombre),
    INDEX idx_fecha (fecha_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Crear Entity `AuditLog.java`**:
```java
@Entity
@Table(name = "audit_log", indexes = {
    @Index(name = "idx_usuario", columnList = "usuario_id"),
    @Index(name = "idx_tabla", columnList = "tabla_nombre"),
    @Index(name = "idx_fecha", columnList = "fecha_hora")
})
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long usuarioId;
    
    @Enumerated(EnumType.STRING)
    private Accion accion; // CREATE, UPDATE, DELETE
    
    @Column(nullable = false, length = 50)
    private String tablaNombre;
    
    private Long registroId;
    private String datosAntes;  // JSON
    private String datatosDespues; // JSON
    private String descripcion;
    
    @Column(length = 45)
    private String ipOrigen;
    
    @CreationTimestamp
    private LocalDateTime fechaHora;
}

public enum Accion {
    CREATE, UPDATE, DELETE, LEER
}
```

**Crear `AuditService.java`**:
```java
@Service
public class AuditService {
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    public void registrar(Long usuarioId, Accion accion, String tabla, 
                         Long registroId, Object datosAntes, Object datosAfter,
                         HttpServletRequest request) {
        AuditLog log = new AuditLog();
        log.setUsuarioId(usuarioId);
        log.setAccion(accion);
        log.setTableName(tabla);
        log.setRegistroId(registroId);
        log.setDatosAntes(convertirAJson(datosAntes));
        log.setDatosDespues(convertirAJson(datosAfter));
        log.setIpOrigen(request.getRemoteAddr());
        
        auditLogRepository.save(log);
    }
    
    private String convertirAJson(Object obj) {
        if (obj == null) return null;
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            return null;
        }
    }
}
```

**Usar en Controllers** (ejemplo):
```java
@PostMapping
public ResponseEntity<?> crearGasto(@RequestBody GastoCreateDto dto) {
    Gasto gasto = gastoService.crear(dto);
    
    auditService.registrar(
        usuarioActual.getId(),
        Accion.CREATE,
        "gastos",
        gasto.getId(),
        null,
        gasto,
        request
    );
    
    return ResponseEntity.ok(gasto);
}
```

---

### 2.3 LOGGING & MONITORING (1 DÍA)

**Crear `application-prod.properties`**:
```properties
# Logging
logging.level.root=WARN
logging.level.com.gastos=INFO
logging.level.org.springframework.web=WARN
logging.level.org.springframework.security=WARN

# File logging
logging.file.name=/var/log/gastos-compartidos/app.log
logging.file.max-size=10MB
logging.file.max-history=30
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n

# Console logging (deshabilitado en prod)
logging.level.org.springframework.boot.web.embedded.tomcat.TomcatWebServer=INFO
```

**Crear `logback-spring.xml`** (opcional pero recomendado):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_FILE" value="/var/log/gastos-compartidos/app.log"/>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}</file>
        <encoder>
            <pattern>%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
            <maxFileSize>10MB</maxFileSize>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>
    
    <root level="WARN">
        <appender-ref ref="FILE"/>
    </root>
    
    <logger name="com.gastos" level="INFO"/>
</configuration>
```

**Monitorear errors**:
```bash
# Ver logs en tiempo real
tail -f /var/log/gastos-compartidos/app.log

# Ver solo errors
grep ERROR /var/log/gastos-compartidos/app.log | tail -20
```

---

### 2.4 INPUT VALIDATION (1 DÍA)

**Mejoras necesarias**:

1. En cada DTO, agregar `@Validated`:
```java
@Validated
public class GastoCreateDto {
    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 3, max = 255, message = "Entre 3 y 255 caracteres")
    private String descripcion;
    
    @NotNull
    @DecimalMin(value = "0.01", message = "Debe ser mayor a 0")
    @DecimalMax(value = "999999999.99")
    private BigDecimal monto;
    
    @NotNull
    private Long categoriaId;
}
```

2. En Controllers, usar `@Valid`:
```java
@PostMapping
public ResponseEntity<?> crear(@Valid @RequestBody GastoCreateDto dto) {
    // Si DTO es inválido, Spring automáticamente retorna 400
    // No es necesario validar manualmente
    return ResponseEntity.ok(gastoService.crear(dto));
}
```

3. Global Exception Handler:
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.toList());
        
        return ResponseEntity
            .status(400)
            .body(Map.of("error", "Validación fallida", "detalles", errors));
    }
}
```

---

### 2.5 ERROR HANDLING (1 DÍA)

**Mejorar manejo de errores**:

1. Custom Exception:
```java
public class GastosException extends RuntimeException {
    private final String codigo;
    private final int statusCode;
    
    public GastosException(String codigo, String message, int statusCode) {
        super(message);
        this.codigo = codigo;
        this.statusCode = statusCode;
    }
}
```

2. Error Handler:
```java
@ExceptionHandler(GastosException.class)
public ResponseEntity<?> handleGastosException(GastosException ex) {
    Map<String, Object> error = Map.ofEntries(
        Map.entry("error", ex.getCodigo()),
        Map.entry("mensaje", ex.getMessage()),
        Map.entry("timestamp", LocalDateTime.now())
    );
    
    // NO incluir stack trace en producción
    return ResponseEntity
        .status(ex.getStatusCode())
        .body(error);
}
```

---

## FASE 3: TESTING (1 DÍA)

### 3.1 LOAD TESTING con `wrk`

```bash
# Instalar wrk (si no está)
# Mac: brew install wrk
# Linux: sudo apt-get install wrk
# Windows: descargar precompilado

# Test básico: 100 conexiones simultáneas, 30 segundos
wrk -t12 -c100 -d30s https://0027-2803-c600-7115-c592-ddd0-8191-263f-46ea.ngrok-free.app/api

# Test de login (cuidado con rate limiting)
wrk -t4 -c10 -d10s -s login.lua https://0027-2803-c600-7115-c592-ddd0-8191-263f-46ea.ngrok-free.app/api/auth/login
```

**Script `login.lua`**:
```lua
request = function()
    wrk.method = "POST"
    wrk.body = '{"email":"test@test.com","password":"password"}'
    wrk.headers["Content-Type"] = "application/json"
    return wrk.format(nil, "/api/auth/login")
end
```

**Resultados esperados**:
- Latency promedio: < 500ms
- 99th percentile: < 2000ms
- Errors: 0% (excepto por rate limiting intencional)

---

### 3.2 TESTING MANUAL

```bash
# 1. Test de Rate Limiting
for i in {1..110}; do
  curl -s https://0027-2803-c600-7115-c592-ddd0-8191-263f-46ea.ngrok-free.app/api/public/categorias | head -c 50
  echo ""
done
# Deberías ver 429 Too Many Requests después de 100

# 2. Test de Auditoría (crear gasto)
curl -X POST https://0027-2803-c600-7115-c592-ddd0-8191-263f-46ea.ngrok-free.app/api/gastos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"descripcion":"Test","monto":100,"categoriaId":1}'
# Verifica que se registre en audit_log

# 3. Test de Logging
tail -f /var/log/gastos-compartidos/app.log
# Deberías ver: "Gasto creado exitosamente"
```

---

## 📋 CHECKLIST FINAL

### Frontend
- [ ] `environment.prod.ts` actualizado
- [ ] Security headers en `index.html`
- [ ] `ng build --configuration production` sin errores
- [ ] Bundle size < 500KB (gzip)
- [ ] Test manual: Login funciona
- [ ] Test manual: Crear gasto funciona

### Backend
- [ ] Rate Limiting implementado y testeado
- [x] Tabla `audit_log` creada
- [x] `AuditService` registrando acciones en todos los controllers
- [ ] `application-prod.properties` configurado
- [ ] Logging funcionando correctamente
- [ ] Input validation en todos los DTOs
- [ ] Error handler global activo
- [ ] Tests: 100+ requests detecta 429
- [ ] Logs: > 100 requests visible en archivo

### Testing
- [ ] Load testing con wrk sin errores críticos
- [ ] Rate limiting activo (429 después de límite)
- [ ] Auditoría registrando cambios
- [ ] No hay stack traces en responses HTTP

### Docker/Deployment
- [ ] Docker build successful
- [ ] ngrok URL actualizada en frontend (si cambia)
- [ ] Database backups configurados
- [ ] Logs persistentes en `/var/log`

---

## 📊 TIMELINE

| Día | Tarea | Status |
|-----|-------|--------|
| 1-2 | Frontend: Build & Security Headers | ✅ |
| 3 | Backend: Rate Limiting | 🔄 |
| 4-5 | Backend: Auditoría completa | ✅ |
| 6 | Backend: Logging & Error Handling | 📋 |
| 7 | Testing: Load & Validación | 📋 |
| 8 | Buffer & Fixes | 📋 |

---

## 🚀 DEPLOYMENT

```bash
# 1. Hacer build del frontend
cd gastos-compartidos-front
ng build --configuration production

# 2. Copiar build a backend (servido por nginx)
cp -r dist/gastos-compartidos-front/* ../gastos-compartidos/src/main/resources/static/

# 3. Build backend
cd ../gastos-compartidos
mvn clean package -DskipTests

# 4. Docker build
docker build -t gastos-backend:prod .

# 5. Docker run
docker-compose -f docker-compose.yml up -d

# 6. Verificar
curl https://0027-2803-c600-7115-c592-ddd0-8191-263f-46ea.ngrok-free.app
# Deberías ver el frontend servido
```

---

## 📞 NOTAS IMPORTANTES

1. **ngrok**: URL cambiar cada 8 horas si usas versión gratuita
   - Solución: Script que actualiza `environment.prod.ts` automáticamente

2. **Backups**: Implementar antes de producción
   ```bash
   # Backup diario a S3
   0 2 * * * /backup-script.sh
   ```

3. **Monitoreo**: Revisar logs diariamente
   ```bash
   # Logs diarios
   grep ERROR /var/log/gastos-compartidos/app.log | wc -l
   ```

4. **Updates**: Si cambias ngrok URL
   - Actualizar `environment.prod.ts`
   - Rebuild frontend
   - Redeploy Docker

---

**¿Preguntas?** Implementamos paso a paso.
