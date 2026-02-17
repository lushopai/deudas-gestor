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

    @Value("${app.jwt.expiration:900000}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;

    private static final String TOKEN_TYPE_CLAIM = "type";
    private static final String ACCESS_TOKEN = "access";
    private static final String REFRESH_TOKEN = "refresh";

    public String generarToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return generarAccessToken(userDetails.getId());
    }

    public String generarTokenDesdeUsuarioId(Long usuarioId) {
        return generarAccessToken(usuarioId);
    }

    public String generarAccessToken(Long usuarioId) {
        return generarTokenInterno(usuarioId, jwtExpirationMs, ACCESS_TOKEN);
    }

    public String generarRefreshToken(Long usuarioId) {
        return generarTokenInterno(usuarioId, refreshExpirationMs, REFRESH_TOKEN);
    }

    private String generarTokenInterno(Long usuarioId, long expiracionMs, String tipo) {
        Date ahora = new Date();
        Date expiryDate = new Date(ahora.getTime() + expiracionMs);
        SecretKey key = getSigningKey();

        return Jwts.builder()
                .subject(usuarioId.toString())
                .claim(TOKEN_TYPE_CLAIM, tipo)
                .issuedAt(ahora)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Long obtenerUsuarioIdDesdeToken(String token) {
        Claims claims = parseClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    public boolean esRefreshToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return REFRESH_TOKEN.equals(claims.get(TOKEN_TYPE_CLAIM, String.class));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validarToken(String token) {
        try {
            Claims claims = parseClaims(token);
            String tipo = claims.get(TOKEN_TYPE_CLAIM, String.class);
            // Solo aceptar access tokens para autenticación de requests
            return tipo == null || ACCESS_TOKEN.equals(tipo);
        } catch (JwtException ex) {
            throw new JwtException("Token JWT inválido o expirado: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Error procesando JWT: " + ex.getMessage());
        }
    }

    public boolean validarRefreshToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return REFRESH_TOKEN.equals(claims.get(TOKEN_TYPE_CLAIM, String.class));
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        SecretKey key = getSigningKey();
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}
