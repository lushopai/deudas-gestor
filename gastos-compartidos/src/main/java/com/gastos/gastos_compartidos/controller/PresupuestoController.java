package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.PresupuestoCreateDTO;
import com.gastos.gastos_compartidos.dto.PresupuestoResponseDTO;
import com.gastos.gastos_compartidos.service.PresupuestoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<List<PresupuestoResponseDTO>> listar(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(presupuestoService.obtenerPorUsuario(userId));
    }

    @GetMapping("/activos")
    @Operation(summary = "Listar presupuestos activos", description = "Solo los presupuestos activos con progreso actual")
    public ResponseEntity<List<PresupuestoResponseDTO>> listarActivos(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(presupuestoService.obtenerActivosPorUsuario(userId));
    }

    @PostMapping
    @Operation(summary = "Crear presupuesto")
    public ResponseEntity<PresupuestoResponseDTO> crear(
            @Valid @RequestBody PresupuestoCreateDTO dto, Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(presupuestoService.crear(userId, dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar presupuesto")
    public ResponseEntity<PresupuestoResponseDTO> actualizar(
            @PathVariable Long id, @Valid @RequestBody PresupuestoCreateDTO dto, Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(presupuestoService.actualizar(id, userId, dto));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Activar/desactivar presupuesto")
    public ResponseEntity<PresupuestoResponseDTO> toggleActivo(
            @PathVariable Long id, Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(presupuestoService.toggleActivo(id, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar presupuesto")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        presupuestoService.eliminar(id, userId);
        return ResponseEntity.noContent().build();
    }
}
