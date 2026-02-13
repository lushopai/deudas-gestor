package com.gastos.gastos_compartidos.security;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

/**
 * Servicio de control de intentos de login fallidos.
 * Bloquea cuentas tras 5 intentos fallidos durante 15 minutos.
 * Usa cache en memoria (se reinicia con el servidor).
 */
@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;
    private static final int CACHE_CLEANUP_THRESHOLD_MINUTES = 30;

    private final Map<String, LoginAttemptInfo> attemptsCache = new ConcurrentHashMap<>();

    /**
     * Registra un intento de login fallido para el email dado.
     */
    public void loginFailed(String email) {
        String key = email.toLowerCase().trim();
        attemptsCache.compute(key, (k, info) -> {
            if (info == null) {
                return new LoginAttemptInfo(1, LocalDateTime.now());
            }
            // Si ya pasó el período de bloqueo, reiniciar contador
            if (info.lockExpiry != null && LocalDateTime.now().isAfter(info.lockExpiry)) {
                return new LoginAttemptInfo(1, LocalDateTime.now());
            }
            int newAttempts = info.attempts + 1;
            LocalDateTime lockExpiry = newAttempts >= MAX_ATTEMPTS
                    ? LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES)
                    : null;
            return new LoginAttemptInfo(newAttempts, info.lastAttempt, lockExpiry);
        });
        cleanupOldEntries();
    }

    /**
     * Registra un login exitoso, limpiando el contador de intentos.
     */
    public void loginSucceeded(String email) {
        attemptsCache.remove(email.toLowerCase().trim());
    }

    /**
     * Verifica si la cuenta está bloqueada por demasiados intentos fallidos.
     */
    public boolean isBlocked(String email) {
        LoginAttemptInfo info = attemptsCache.get(email.toLowerCase().trim());
        if (info == null) {
            return false;
        }
        // Si tiene lockExpiry y aún no ha pasado, está bloqueada
        if (info.lockExpiry != null) {
            if (LocalDateTime.now().isBefore(info.lockExpiry)) {
                return true;
            }
            // El bloqueo expiró, limpiar
            attemptsCache.remove(email.toLowerCase().trim());
            return false;
        }
        return false;
    }

    /**
     * Obtiene los minutos restantes de bloqueo, o 0 si no está bloqueada.
     */
    public long getMinutesUntilUnlock(String email) {
        LoginAttemptInfo info = attemptsCache.get(email.toLowerCase().trim());
        if (info == null || info.lockExpiry == null) {
            return 0;
        }
        long seconds = java.time.Duration.between(LocalDateTime.now(), info.lockExpiry).getSeconds();
        return Math.max(0, (seconds + 59) / 60); // Redondear hacia arriba
    }

    /**
     * Obtiene los intentos restantes antes del bloqueo.
     */
    public int getRemainingAttempts(String email) {
        LoginAttemptInfo info = attemptsCache.get(email.toLowerCase().trim());
        if (info == null) {
            return MAX_ATTEMPTS;
        }
        return Math.max(0, MAX_ATTEMPTS - info.attempts);
    }

    /**
     * Limpia entradas antiguas del cache para evitar crecimiento sin límite.
     */
    private void cleanupOldEntries() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(CACHE_CLEANUP_THRESHOLD_MINUTES);
        attemptsCache.entrySet().removeIf(entry -> {
            LoginAttemptInfo info = entry.getValue();
            // Remover si el último intento fue hace más de 30 min y no tiene bloqueo activo
            return info.lastAttempt.isBefore(threshold)
                    && (info.lockExpiry == null || LocalDateTime.now().isAfter(info.lockExpiry));
        });
    }

    private static class LoginAttemptInfo {
        final int attempts;
        final LocalDateTime lastAttempt;
        final LocalDateTime lockExpiry;

        LoginAttemptInfo(int attempts, LocalDateTime lastAttempt) {
            this(attempts, lastAttempt, null);
        }

        LoginAttemptInfo(int attempts, LocalDateTime lastAttempt, LocalDateTime lockExpiry) {
            this.attempts = attempts;
            this.lastAttempt = lastAttempt;
            this.lockExpiry = lockExpiry;
        }
    }
}
