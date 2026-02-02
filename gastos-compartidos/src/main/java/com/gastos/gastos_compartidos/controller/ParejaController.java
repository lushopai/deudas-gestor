package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.ParejaResponseDTO;
import com.gastos.gastos_compartidos.dto.UnirParejaRequestDTO;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import com.gastos.gastos_compartidos.service.ParejaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parejas")
@RequiredArgsConstructor
@Tag(name = "Parejas", description = "Gestión de parejas y grupo compartido")
@SecurityRequirement(name = "bearer-jwt")
public class ParejaController {

    private final ParejaService parejaService;

    @GetMapping("/mi-pareja")
    @Operation(summary = "Obtener información de mi pareja", description = "Obtiene los detalles de la pareja del usuario autenticado")
    public ResponseEntity<ParejaResponseDTO> obtenerMiPareja(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        ParejaResponseDTO pareja = parejaService.obtenerDetallePareja(
            parejaService.obtenerParejaDelUsuario(currentUser.getId()).getId()
        );
        return ResponseEntity.ok(pareja);
    }

    @GetMapping("/codigo-invitacion")
    @Operation(summary = "Obtener código de invitación", description = "Genera o obtiene el código para invitar a la pareja")
    public ResponseEntity<String> obtenerCodigoInvitacion(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        String codigo = parejaService.generarCodigoInvitacion(currentUser.getId());
        return ResponseEntity.ok(codigo);
    }

    @PostMapping("/unirse")
    @Operation(summary = "Unirse a una pareja", description = "Se une a una pareja usando un código de invitación")
    public ResponseEntity<ParejaResponseDTO> unirse(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody UnirParejaRequestDTO request) {
        
        parejaService.unirParejaConCodigo(currentUser.getId(), request.getCodigoInvitacion());
        ParejaResponseDTO pareja = parejaService.obtenerDetallePareja(
            parejaService.obtenerParejaDelUsuario(currentUser.getId()).getId()
        );
        return ResponseEntity.ok(pareja);
    }

    @GetMapping("/{parejaId}")
    @Operation(summary = "Obtener información de pareja", description = "Obtiene los detalles de una pareja específica")
    public ResponseEntity<ParejaResponseDTO> obtenerPareja(@PathVariable Long parejaId) {
        ParejaResponseDTO pareja = parejaService.obtenerDetallePareja(parejaId);
        return ResponseEntity.ok(pareja);
    }
}
