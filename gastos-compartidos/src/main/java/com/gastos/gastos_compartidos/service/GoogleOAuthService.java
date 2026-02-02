package com.gastos.gastos_compartidos.service;

import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gastos.gastos_compartidos.entity.Usuario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final UsuarioService usuarioService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    /**
     * Verifica y decodifica el token JWT de Google
     * @param idToken Token JWT de Google
     * @return Datos del usuario extraídos del token
     */
    public GoogleUserInfo verificarYExtraerToken(String idToken) {
        try {
            // Decodificar JWT sin validar firma (en producción, validar con las claves de Google)
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Token inválido");
            }

            // Decodificar payload
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            JsonNode payloadJson = objectMapper.readTree(payload);

            GoogleUserInfo userInfo = new GoogleUserInfo();
            userInfo.setGoogleId(payloadJson.get("sub").asText());
            userInfo.setEmail(payloadJson.get("email").asText());
            userInfo.setNombre(payloadJson.get("given_name").asText(null));
            userInfo.setApellido(payloadJson.get("family_name").asText(null));
            userInfo.setFoto(payloadJson.get("picture").asText(null));

            return userInfo;
        } catch (Exception e) {
            log.error("Error verificando token de Google", e);
            throw new RuntimeException("Token de Google inválido", e);
        }
    }

    /**
     * Registra o actualiza un usuario autenticado con Google
     * @param userInfo Información del usuario desde Google
     * @return Usuario creado o actualizado
     */
    public Usuario registrarOActualizarUsuarioGoogle(GoogleUserInfo userInfo) {
        try {
            return usuarioService.obtenerOCrearPorGoogleId(
                userInfo.getGoogleId(),
                userInfo.getEmail(),
                userInfo.getNombre() != null ? userInfo.getNombre() : "Usuario",
                userInfo.getApellido() != null ? userInfo.getApellido() : "Google",
                userInfo.getFoto()
            );
        } catch (Exception e) {
            log.error("Error registrando usuario de Google", e);
            throw new RuntimeException("Error al registrar usuario", e);
        }
    }

    /**
     * DTO para almacenar información del usuario de Google
     */
    public static class GoogleUserInfo {
        private String googleId;
        private String email;
        private String nombre;
        private String apellido;
        private String foto;

        // Getters y Setters
        public String getGoogleId() {
            return googleId;
        }

        public void setGoogleId(String googleId) {
            this.googleId = googleId;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getApellido() {
            return apellido;
        }

        public void setApellido(String apellido) {
            this.apellido = apellido;
        }

        public String getFoto() {
            return foto;
        }

        public void setFoto(String foto) {
            this.foto = foto;
        }
    }
}
