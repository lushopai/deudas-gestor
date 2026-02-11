package com.gastos.gastos_compartidos.config;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Configuración de Rate Limiting
 * Implementa un patrón Token Bucket simplificado para limitar requests por usuario/IP
 */
@Component
public class RateLimitConfig {

    // Cache de buckets por clave (usuario o IP)
    private final Map<String, TokenBucket> cache = new ConcurrentHashMap<>();

    /**
     * Intenta consumir un token del bucket asociado a la clave
     * 
     * @param key            Identificador único (usuario:endpoint o ip:endpoint)
     * @param capacity       Número máximo de tokens (requests)
     * @param refillDuration Tiempo para rellenar los tokens
     * @return Resultado del intento de consumo
     */
    public RateLimitResult tryConsume(String key, int capacity, Duration refillDuration) {
        TokenBucket bucket = cache.computeIfAbsent(key, k -> new TokenBucket(capacity, refillDuration));
        return bucket.tryConsume();
    }

    public static class RateLimitResult {
        private final boolean consumed;
        private final long remainingTokens;
        private final long retryAfterSeconds;

        public RateLimitResult(boolean consumed, long remainingTokens, long retryAfterSeconds) {
            this.consumed = consumed;
            this.remainingTokens = remainingTokens;
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public boolean isConsumed() { return consumed; }
        public long getRemainingTokens() { return remainingTokens; }
        public long getRetryAfterSeconds() { return retryAfterSeconds; }
    }

    private static class TokenBucket {
        private final long capacity;
        private final long refillDurationNanos;
        private double tokens;
        private long lastRefillNanos;

        public TokenBucket(long capacity, Duration refillDuration) {
            this.capacity = capacity;
            this.refillDurationNanos = refillDuration.toNanos();
            this.tokens = capacity;
            this.lastRefillNanos = System.nanoTime();
        }

        public synchronized RateLimitResult tryConsume() {
            refill();
            if (tokens >= 1) {
                tokens -= 1;
                return new RateLimitResult(true, (long) tokens, 0);
            } else {
                long nanosToWait = (long) ((1 - tokens) * refillDurationNanos / capacity);
                return new RateLimitResult(false, 0, nanosToWait / 1_000_000_000);
            }
        }

        private void refill() {
            long now = System.nanoTime();
            long delta = now - lastRefillNanos;
            if (delta > 0) {
                double tokensToAdd = (double) delta * capacity / refillDurationNanos;
                tokens = Math.min(capacity, tokens + tokensToAdd);
                lastRefillNanos = now;
            }
        }
    }

    /**
     * Limpia el cache (útil para testing o mantenimiento)
     */
    public void clearCache() {
        cache.clear();
    }

    /**
     * Obtiene el tamaño actual del cache
     */
    public int getCacheSize() {
        return cache.size();
    }
}
