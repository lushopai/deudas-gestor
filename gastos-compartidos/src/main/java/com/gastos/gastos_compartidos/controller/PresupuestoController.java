package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.PresupuestoCreateDTO;
import com.gastos.gastos_compartidos.dto.PresupuestoResponseDTO;
import com.gastos.gastos_compartidos.service.PresupuestoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presupuestos")
@RequiredArgsConstructor
@Tag(name = "Presupuestos", description = "Gestión de presupuestos por categoría")
public class PresupuestoController {

    private final PresupuestoService presupuestoService;

    @GetMapping
    @Operation(summary = "Listar presupuestos", description = "Obtiene todos los presupuestos del usuario")
    public ResponseEntity<List<PresupuestoResponseDTO>> listar(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(presupuestoService.obtenerPorUsuario(currentUser.getId()));
    }

    @GetMapping("/activos")
    @Operation(summary = "Listar presupuestos activos", description = "Solo los presupuestos activos con progreso actual")
    public ResponseEntity<List<PresupuestoResponseDTO>> listarActivos(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(presupuestoService.obtenerActivosPorUsuario(currentUser.getId()));
    }

    @PostMapping
    @Operation(summary = "Crear presupuesto")
    public ResponseEntity<PresupuestoResponseDTO> crear(
            @Valid @RequestBody PresupuestoCreateDTO dto, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(presupuestoService.crear(currentUser.getId(), dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar presupuesto")
    public ResponseEntity<PresupuestoResponseDTO> actualizar(
            @PathVariable Long id, @Valid @RequestBody PresupuestoCreateDTO dto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(presupuestoService.actualizar(id, currentUser.getId(), dto));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Activar/desactivar presupuesto")
    public ResponseEntity<PresupuestoResponseDTO> toggleActivo(
            @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(presupuestoService.toggleActivo(id, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar presupuesto")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        presupuestoService.eliminar(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
