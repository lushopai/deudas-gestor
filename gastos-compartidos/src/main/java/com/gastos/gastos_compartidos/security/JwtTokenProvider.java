package com.gastos.gastos_compartidos.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:86400000}") // 24 horas por defecto
    private long jwtExpirationMs;

    public String generarToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return generarTokenDesdeUsuarioId(userDetails.getId());
    }

    public String generarTokenDesdeUsuarioId(Long usuarioId) {
        Date ahora = new Date();
        Date expiryDate = new Date(ahora.getTime() + jwtExpirationMs);
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(usuarioId.toString())
                .issuedAt(ahora)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Long obtenerUsuarioIdDesdeToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.valueOf(claims.getSubject());
    }

    public boolean validarToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException ex) {
            throw new JwtException("Token JWT inválido o expirado: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Error procesando JWT: " + ex.getMessage());
        }
    }
}
