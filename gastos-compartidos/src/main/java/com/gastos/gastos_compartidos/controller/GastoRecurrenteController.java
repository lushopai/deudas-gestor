package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.GastoRecurrenteCreateDTO;
import com.gastos.gastos_compartidos.dto.GastoRecurrenteResponseDTO;
import com.gastos.gastos_compartidos.entity.AuditAction;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import com.gastos.gastos_compartidos.service.AuditService;
import com.gastos.gastos_compartidos.service.GastoRecurrenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gastos-recurrentes")
@RequiredArgsConstructor
@Tag(name = "Gastos Recurrentes", description = "Gestión de gastos recurrentes programados")
@SecurityRequirement(name = "bearer-jwt")
public class GastoRecurrenteController {

    private final GastoRecurrenteService gastoRecurrenteService;
    private final AuditService auditService;

    @PostMapping
    @Operation(summary = "Crear gasto recurrente", description = "Crea un nuevo gasto recurrente programado")
    public ResponseEntity<GastoRecurrenteResponseDTO> crear(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody GastoRecurrenteCreateDTO dto,
            HttpServletRequest httpRequest) {
        GastoRecurrenteResponseDTO recurrente = gastoRecurrenteService.crear(currentUser.getId(), dto);
        auditService.registrar(currentUser.getId(), AuditAction.CREATE, "gastos_recurrentes",
                recurrente.getId(), null, recurrente, "Gasto recurrente creado: " + dto.getDescripcion(), httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(recurrente);
    }

    @GetMapping
    @Operation(summary = "Listar gastos recurrentes", description = "Obtiene todos los gastos recurrentes del usuario")
    public ResponseEntity<List<GastoRecurrenteResponseDTO>> listar(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(required = false, defaultValue = "false") boolean soloActivos) {
        List<GastoRecurrenteResponseDTO> lista = soloActivos
                ? gastoRecurrenteService.obtenerActivosPorUsuario(currentUser.getId())
                : gastoRecurrenteService.obtenerPorUsuario(currentUser.getId());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener gasto recurrente", description = "Obtiene el detalle de un gasto recurrente")
    public ResponseEntity<GastoRecurrenteResponseDTO> obtener(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(gastoRecurrenteService.obtenerPorId(id, currentUser.getId()));
    }

    @GetMapping("/proximos")
    @Operation(summary = "Próximos gastos", description = "Obtiene gastos recurrentes próximos a ejecutarse")
    public ResponseEntity<List<GastoRecurrenteResponseDTO>> proximos(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(required = false, defaultValue = "7") int dias) {
        return ResponseEntity.ok(gastoRecurrenteService.obtenerProximos(currentUser.getId(), dias));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar gasto recurrente", description = "Actualiza un gasto recurrente existente")
    public ResponseEntity<GastoRecurrenteResponseDTO> actualizar(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @Valid @RequestBody GastoRecurrenteCreateDTO dto,
            HttpServletRequest httpRequest) {
        GastoRecurrenteResponseDTO antes = gastoRecurrenteService.obtenerPorId(id, currentUser.getId());
        GastoRecurrenteResponseDTO recurrente = gastoRecurrenteService.actualizar(id, currentUser.getId(), dto);
        auditService.registrar(currentUser.getId(), AuditAction.UPDATE, "gastos_recurrentes",
                id, antes, recurrente, "Gasto recurrente actualizado: " + dto.getDescripcion(), httpRequest);
        return ResponseEntity.ok(recurrente);
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Activar/desactivar", description = "Activa o desactiva un gasto recurrente")
    public ResponseEntity<GastoRecurrenteResponseDTO> toggleActivo(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        GastoRecurrenteResponseDTO recurrente = gastoRecurrenteService.toggleActivo(id, currentUser.getId());
        auditService.registrar(currentUser.getId(), AuditAction.UPDATE, "gastos_recurrentes",
                id, null, recurrente, "Gasto recurrente toggle activo", httpRequest);
        return ResponseEntity.ok(recurrente);
    }

    @PostMapping("/{id}/ejecutar")
    @Operation(summary = "Ejecutar manualmente", description = "Genera el gasto de forma manual sin esperar la fecha programada")
    public ResponseEntity<Map<String, String>> ejecutarManualmente(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        gastoRecurrenteService.ejecutarManualmente(id, currentUser.getId());
        auditService.registrar(currentUser.getId(), AuditAction.CREATE, "gastos_recurrentes",
                id, null, null, "Gasto recurrente ejecutado manualmente", httpRequest);
        return ResponseEntity.ok(Map.of("mensaje", "Gasto generado exitosamente"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar gasto recurrente", description = "Elimina un gasto recurrente")
    public ResponseEntity<Void> eliminar(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        GastoRecurrenteResponseDTO antes = gastoRecurrenteService.obtenerPorId(id, currentUser.getId());
        gastoRecurrenteService.eliminar(id, currentUser.getId());
        auditService.registrar(currentUser.getId(), AuditAction.DELETE, "gastos_recurrentes",
                id, antes, null, "Gasto recurrente eliminado", httpRequest);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/resumen")
    @Operation(summary = "Resumen", description = "Obtiene el conteo de gastos recurrentes activos")
    public ResponseEntity<Map<String, Long>> resumen(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        long activos = gastoRecurrenteService.contarActivos(currentUser.getId());
        return ResponseEntity.ok(Map.of("activos", activos));
    }
}
