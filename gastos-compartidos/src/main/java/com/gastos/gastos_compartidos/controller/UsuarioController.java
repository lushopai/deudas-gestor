package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.ActualizarPerfilDTO;
import com.gastos.gastos_compartidos.dto.CambiarPasswordDTO;
import com.gastos.gastos_compartidos.dto.UsuarioResponseDTO;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import com.gastos.gastos_compartidos.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de perfiles de usuarios")
@SecurityRequirement(name = "bearer-jwt")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/me")
    @Operation(summary = "Obtener mi perfil", description = "Obtiene la información del usuario autenticado")
    public ResponseEntity<UsuarioResponseDTO> obtenerMiPerfil(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        UsuarioResponseDTO perfil = usuarioService.obtenerPerfil(currentUser.getId());
        return ResponseEntity.ok(perfil);
    }

    @PutMapping("/me")
    @Operation(summary = "Actualizar mi perfil", description = "Actualiza los datos del usuario autenticado")
    public ResponseEntity<UsuarioResponseDTO> actualizarPerfil(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody ActualizarPerfilDTO dto) {

        UsuarioResponseDTO perfil = usuarioService.actualizarPerfil(currentUser.getId(), dto);
        return ResponseEntity.ok(perfil);
    }

    @PutMapping("/me/password")
    @Operation(summary = "Cambiar contraseña", description = "Cambia la contraseña del usuario autenticado")
    public ResponseEntity<Map<String, String>> cambiarPassword(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody CambiarPasswordDTO dto) {
        usuarioService.cambiarPassword(currentUser.getId(), dto);
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener perfil de usuario", description = "Obtiene la información de un usuario específico")
    public ResponseEntity<UsuarioResponseDTO> obtenerPerfil(@PathVariable Long id) {
        UsuarioResponseDTO perfil = usuarioService.obtenerPerfil(id);
        return ResponseEntity.ok(perfil);
    }
}
