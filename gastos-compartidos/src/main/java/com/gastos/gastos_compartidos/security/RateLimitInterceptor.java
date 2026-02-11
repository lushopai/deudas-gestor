package com.gastos.gastos_compartidos.security;

import java.time.Duration;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.gastos.gastos_compartidos.config.RateLimitConfig;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitConfig rateLimitConfig;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String key = resolveKey(request);
        // Configuración por defecto: 50 peticiones por minuto por usuario/IP
        RateLimitConfig.RateLimitResult result = rateLimitConfig.tryConsume(key, 50, Duration.ofMinutes(1));

        if (result.isConsumed()) {
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(result.getRemainingTokens()));
            return true;
        } else {
            response.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(result.getRetryAfterSeconds()));
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(), "Has excedido el límite de peticiones");
            return false;
        }
    }

    private String resolveKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return "user:" + authentication.getName();
        }
        return "ip:" + request.getRemoteAddr();
    }
}