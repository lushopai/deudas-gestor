package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.PresupuestoCreateDTO;
import com.gastos.gastos_compartidos.dto.PresupuestoResponseDTO;
import com.gastos.gastos_compartidos.entity.AuditAction;
import com.gastos.gastos_compartidos.service.AuditService;
import com.gastos.gastos_compartidos.service.PresupuestoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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
    private final AuditService auditService;

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
            @Valid @RequestBody PresupuestoCreateDTO dto,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        PresupuestoResponseDTO presupuesto = presupuestoService.crear(currentUser.getId(), dto);
        auditService.registrar(currentUser.getId(), AuditAction.CREATE, "presupuestos",
                presupuesto.getId(), null, presupuesto, "Presupuesto creado", httpRequest);
        return ResponseEntity.ok(presupuesto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar presupuesto")
    public ResponseEntity<PresupuestoResponseDTO> actualizar(
            @PathVariable Long id, @Valid @RequestBody PresupuestoCreateDTO dto,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        PresupuestoResponseDTO antes = presupuestoService.obtenerPorUsuario(currentUser.getId())
                .stream().filter(p -> p.getId().equals(id)).findFirst().orElse(null);
        PresupuestoResponseDTO presupuesto = presupuestoService.actualizar(id, currentUser.getId(), dto);
        auditService.registrar(currentUser.getId(), AuditAction.UPDATE, "presupuestos",
                id, antes, presupuesto, "Presupuesto actualizado", httpRequest);
        return ResponseEntity.ok(presupuesto);
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Activar/desactivar presupuesto")
    public ResponseEntity<PresupuestoResponseDTO> toggleActivo(
            @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        PresupuestoResponseDTO presupuesto = presupuestoService.toggleActivo(id, currentUser.getId());
        auditService.registrar(currentUser.getId(), AuditAction.UPDATE, "presupuestos",
                id, null, presupuesto, "Presupuesto toggle activo", httpRequest);
        return ResponseEntity.ok(presupuesto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar presupuesto")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        presupuestoService.eliminar(id, currentUser.getId());
        auditService.registrar(currentUser.getId(), AuditAction.DELETE, "presupuestos",
                id, null, null, "Presupuesto eliminado", httpRequest);
        return ResponseEntity.noContent().build();
    }
}
