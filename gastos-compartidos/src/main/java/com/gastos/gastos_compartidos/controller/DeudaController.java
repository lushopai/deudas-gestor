package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.*;
import com.gastos.gastos_compartidos.entity.AuditAction;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import com.gastos.gastos_compartidos.service.AuditService;
import com.gastos.gastos_compartidos.service.DeudaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/deudas")
@RequiredArgsConstructor
@Tag(name = "Deudas", description = "Gestión de deudas externas y abonos")
@SecurityRequirement(name = "bearer-jwt")
public class DeudaController {

    private final DeudaService deudaService;
    private final AuditService auditService;

    // ==================== DEUDAS ====================

    @PostMapping
    @Operation(summary = "Crear nueva deuda", description = "Registra una nueva deuda externa")
    public ResponseEntity<DeudaResponseDTO> crearDeuda(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody DeudaCreateDTO dto,
            HttpServletRequest httpRequest) {
        DeudaResponseDTO deuda = deudaService.crearDeuda(currentUser.getId(), dto);
        auditService.registrar(currentUser.getId(), AuditAction.CREATE, "deudas",
                deuda.getId(), null, deuda, "Deuda creada: " + dto.getDescripcion(), httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(deuda);
    }

    @GetMapping
    @Operation(summary = "Listar deudas (paginado)", description = "Obtiene las deudas del usuario con paginación")
    public ResponseEntity<Page<DeudaResponseDTO>> obtenerDeudas(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(required = false, defaultValue = "false") boolean soloActivas,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<DeudaResponseDTO> deudas = deudaService.obtenerDeudasUsuarioPaginado(currentUser.getId(), soloActivas,
                pageable);
        return ResponseEntity.ok(deudas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener deuda", description = "Obtiene el detalle de una deuda con sus últimos abonos")
    public ResponseEntity<DeudaResponseDTO> obtenerDeuda(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(deudaService.obtenerDeuda(currentUser.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar deuda", description = "Actualiza los datos de una deuda")
    public ResponseEntity<DeudaResponseDTO> actualizarDeuda(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @Valid @RequestBody DeudaCreateDTO dto,
            HttpServletRequest httpRequest) {
        DeudaResponseDTO deudaAntes = deudaService.obtenerDeuda(currentUser.getId(), id);
        DeudaResponseDTO deuda = deudaService.actualizarDeuda(currentUser.getId(), id, dto);
        auditService.registrar(currentUser.getId(), AuditAction.UPDATE, "deudas",
                id, deudaAntes, deuda, "Deuda actualizada: " + dto.getDescripcion(), httpRequest);
        return ResponseEntity.ok(deuda);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar deuda", description = "Elimina una deuda y todos sus abonos")
    public ResponseEntity<Void> eliminarDeuda(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        DeudaResponseDTO deudaAntes = deudaService.obtenerDeuda(currentUser.getId(), id);
        deudaService.eliminarDeuda(currentUser.getId(), id);
        auditService.registrar(currentUser.getId(), AuditAction.DELETE, "deudas",
                id, deudaAntes, null, "Deuda eliminada", httpRequest);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar deuda", description = "Marca una deuda como cancelada sin eliminarla")
    public ResponseEntity<DeudaResponseDTO> cancelarDeuda(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        DeudaResponseDTO deudaAntes = deudaService.obtenerDeuda(currentUser.getId(), id);
        DeudaResponseDTO deuda = deudaService.cancelarDeuda(currentUser.getId(), id);
        auditService.registrar(currentUser.getId(), AuditAction.UPDATE, "deudas",
                id, deudaAntes, deuda, "Deuda cancelada", httpRequest);
        return ResponseEntity.ok(deuda);
    }

    // ==================== ABONOS ====================

    @PostMapping("/{deudaId}/abonos")
    @Operation(summary = "Registrar abono", description = "Registra un abono a una deuda")
    public ResponseEntity<AbonoDeudaResponseDTO> registrarAbono(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long deudaId,
            @Valid @RequestBody AbonoDeudaCreateDTO dto,
            HttpServletRequest httpRequest) {
        AbonoDeudaResponseDTO abono = deudaService.registrarAbono(currentUser.getId(), deudaId, dto);
        auditService.registrar(currentUser.getId(), AuditAction.CREATE, "abonos_deuda",
                abono.getId(), null, abono, "Abono registrado en deuda #" + deudaId, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(abono);
    }

    @GetMapping("/{deudaId}/abonos")
    @Operation(summary = "Listar abonos", description = "Obtiene el historial de abonos de una deuda")
    public ResponseEntity<List<AbonoDeudaResponseDTO>> obtenerAbonos(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long deudaId) {
        return ResponseEntity.ok(deudaService.obtenerAbonosDeuda(currentUser.getId(), deudaId));
    }

    @DeleteMapping("/{deudaId}/abonos/{abonoId}")
    @Operation(summary = "Eliminar abono", description = "Elimina un abono y restaura el saldo de la deuda")
    public ResponseEntity<Void> eliminarAbono(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long deudaId,
            @PathVariable Long abonoId,
            HttpServletRequest httpRequest) {
        deudaService.eliminarAbono(currentUser.getId(), deudaId, abonoId);
        auditService.registrar(currentUser.getId(), AuditAction.DELETE, "abonos_deuda",
                abonoId, null, null, "Abono eliminado de deuda #" + deudaId, httpRequest);
        return ResponseEntity.noContent().build();
    }

    // ==================== RESUMEN ====================

    @GetMapping("/resumen")
    @Operation(summary = "Resumen de deudas", description = "Obtiene un resumen de todas las deudas del usuario")
    public ResponseEntity<ResumenDeudasDTO> obtenerResumen(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(deudaService.obtenerResumen(currentUser.getId()));
    }
}
