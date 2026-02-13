package com.gastos.gastos_compartidos.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gastos.gastos_compartidos.dto.AuthRequestDTO;
import com.gastos.gastos_compartidos.dto.AuthResponseDTO;
import com.gastos.gastos_compartidos.dto.GoogleLoginRequestDTO;
import com.gastos.gastos_compartidos.dto.RegistroRequestDTO;
import com.gastos.gastos_compartidos.entity.Usuario;
import com.gastos.gastos_compartidos.security.JwtTokenProvider;
import com.gastos.gastos_compartidos.service.GoogleOAuthService;
import com.gastos.gastos_compartidos.service.UsuarioService;
import com.gastos.gastos_compartidos.security.LoginAttemptService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints de autenticación y registro")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioService usuarioService;
    private final GoogleOAuthService googleOAuthService;
    private final LoginAttemptService loginAttemptService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autenticarse con email y contraseña")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequestDTO request) {
        String email = request.getEmail();

        // Verificar si la cuenta está bloqueada
        if (loginAttemptService.isBlocked(email)) {
            long minutesLeft = loginAttemptService.getMinutesUntilUnlock(email);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(java.util.Map.of(
                            "mensaje", "Cuenta bloqueada temporalmente por demasiados intentos fallidos",
                            "minutosRestantes", minutesLeft));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.getPassword()));

            // Login exitoso: limpiar intentos fallidos
            loginAttemptService.loginSucceeded(email);

            String token = tokenProvider.generarToken(authentication);
            Usuario usuario = usuarioService.obtenerPorEmail(email);

            return ResponseEntity.ok(AuthResponseDTO.fromUsuario(token, usuario));
        } catch (Exception e) {
            // Login fallido: registrar intento
            loginAttemptService.loginFailed(email);
            int remaining = loginAttemptService.getRemainingAttempts(email);

            if (remaining <= 0) {
                long minutesLeft = loginAttemptService.getMinutesUntilUnlock(email);
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(java.util.Map.of(
                                "mensaje",
                                "Cuenta bloqueada por " + minutesLeft + " minutos tras demasiados intentos fallidos",
                                "minutosRestantes", minutesLeft));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of(
                            "mensaje", "Credenciales inválidas",
                            "intentosRestantes", remaining));
        }
    }

    @PostMapping("/registro")
    @Operation(summary = "Registrar nuevo usuario", description = "Crear una nueva cuenta con email y contraseña")
    public ResponseEntity<?> registro(@Valid @RequestBody RegistroRequestDTO request) {
        Usuario usuario = usuarioService.registrarUsuario(request);
        String token = tokenProvider.generarTokenDesdeUsuarioId(usuario.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthResponseDTO.fromUsuario(token, usuario));
    }

    @PostMapping("/google-login")
    @Operation(summary = "Iniciar sesión con Google", description = "Autenticarse con token de Google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequestDTO request) {
        try {
            // Verificar y extraer información del token de Google
            GoogleOAuthService.GoogleUserInfo userInfo = googleOAuthService.verificarYExtraerToken(request.getToken());

            // Registrar o actualizar usuario
            Usuario usuario = googleOAuthService.registrarOActualizarUsuarioGoogle(userInfo);

            // Generar token JWT local
            String token = tokenProvider.generarTokenDesdeUsuarioId(usuario.getId());

            return ResponseEntity.ok(AuthResponseDTO.fromUsuario(token, usuario));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error al autenticar con Google: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refrescar token", description = "Obtener un nuevo token")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String bearerToken) {
        String token = bearerToken.substring(7);
        Long usuarioId = tokenProvider.obtenerUsuarioIdDesdeToken(token);
        String nuevoToken = tokenProvider.generarTokenDesdeUsuarioId(usuarioId);

        Usuario usuario = usuarioService.obtenerPorId(usuarioId);
        return ResponseEntity.ok(AuthResponseDTO.fromUsuario(nuevoToken, usuario));
    }
}
