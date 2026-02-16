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
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String userKey = resolveKey(request);
        String path = request.getRequestURI();

        int capacity;
        Duration duration;

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/registro")) {
            capacity = 5;
            duration = Duration.ofMinutes(15);
        } else if (path.startsWith("/api/ocr/")) {
            capacity = 10;
            duration = Duration.ofMinutes(1);
        } else {
            capacity = 50;
            duration = Duration.ofMinutes(1);
        }

        String rateLimitKey = userKey + ":" + resolveEndpointGroup(path);
        RateLimitConfig.RateLimitResult result = rateLimitConfig.tryConsume(rateLimitKey, capacity, duration);

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
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            return "user:" + authentication.getName();
        }
        return "ip:" + request.getRemoteAddr();
    }

    private String resolveEndpointGroup(String path) {
        if (path.startsWith("/api/auth/"))
            return "auth";
        if (path.startsWith("/api/ocr/"))
            return "ocr";
        return "general";
    }
}