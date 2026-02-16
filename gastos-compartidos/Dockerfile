# Build stage
FROM maven:3.8.1-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/gastos-compartidos-*.jar app.jar

# Crear usuario no-root y directorio de logs
RUN addgroup -S appuser && adduser -S appuser -G appuser && \
    mkdir -p /app/logs && \
    chown -R appuser:appuser /app/logs
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
