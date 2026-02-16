package com.gastos.gastos_compartidos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gastos.gastos_compartidos.dto.GastoCreateDTO;
import com.gastos.gastos_compartidos.dto.GastoResponseDTO;
import com.gastos.gastos_compartidos.entity.AuditAction;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import com.gastos.gastos_compartidos.service.AuditService;
import com.gastos.gastos_compartidos.service.GastoService;
import com.gastos.gastos_compartidos.service.ParejaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/gastos")
@RequiredArgsConstructor
@Tag(name = "Gastos", description = "Gestión de gastos y división de costos")
@SecurityRequirement(name = "bearer-jwt")
public class GastoController {

    private final GastoService gastoService;
    private final ParejaService parejaService;
    private final AuditService auditService;

    @PostMapping
    @Operation(summary = "Crear nuevo gasto", description = "Registra un nuevo gasto con su división entre usuarios")
    public ResponseEntity<GastoResponseDTO> crearGasto(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody GastoCreateDTO request,
            HttpServletRequest httpRequest) {

        GastoResponseDTO gasto = gastoService.crearGasto(currentUser.getId(), request);
        auditService.registrar(currentUser.getId(), AuditAction.CREATE, "gastos",
                gasto.getId(), null, gasto, "Gasto creado: " + request.getDescripcion(), httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(gasto);
    }

    @PutMapping("/{gastoId}")
    @Operation(summary = "Actualizar gasto", description = "Actualiza un gasto existente (solo el usuario que lo registró puede hacerlo)")
    public ResponseEntity<GastoResponseDTO> actualizarGasto(
            @PathVariable Long gastoId,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody GastoCreateDTO request,
            HttpServletRequest httpRequest) {

        GastoResponseDTO gastoAntes = gastoService.obtenerGasto(gastoId);
        GastoResponseDTO gasto = gastoService.actualizarGasto(gastoId, currentUser.getId(), request);
        auditService.registrar(currentUser.getId(), AuditAction.UPDATE, "gastos",
                gastoId, gastoAntes, gasto, "Gasto actualizado: " + request.getDescripcion(), httpRequest);
        return ResponseEntity.ok(gasto);
    }

    @GetMapping("/{gastoId}")
    @Operation(summary = "Obtener detalles de un gasto", description = "Obtiene la información completa de un gasto específico")
    public ResponseEntity<GastoResponseDTO> obtenerGasto(@PathVariable Long gastoId) {
        GastoResponseDTO gasto = gastoService.obtenerGasto(gastoId);
        return ResponseEntity.ok(gasto);
    }

    @GetMapping
    @Operation(summary = "Obtener gastos del usuario (paginado)", description = "Lista los gastos del usuario autenticado con paginación")
    public ResponseEntity<Page<GastoResponseDTO>> obtenerGastosDelUsuario(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<GastoResponseDTO> gastos = gastoService.obtenerGastosPorUsuarioPaginado(currentUser.getId(), pageable);
        return ResponseEntity.ok(gastos);
    }

    @GetMapping("/recientes")
    @Operation(summary = "Obtener gastos recientes", description = "Lista los últimos gastos del usuario")
    public ResponseEntity<List<GastoResponseDTO>> obtenerGastosRecientes(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "5") int cantidad) {

        List<GastoResponseDTO> gastos = gastoService.obtenerGastosRecientes(currentUser.getId(), cantidad);
        return ResponseEntity.ok(gastos);
    }

    @GetMapping("/resumen")
    @Operation(summary = "Obtener resumen de gastos", description = "Obtiene el total, promedio y desglose por categoría")
    public ResponseEntity<Map<String, Object>> obtenerResumenGastos(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Map<String, Object> resumen = gastoService.obtenerResumenGastos(currentUser.getId());
        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/pareja/todos")
    @Operation(summary = "Obtener gastos de la pareja (paginado)", description = "Lista los gastos de la pareja con paginación")
    public ResponseEntity<Page<GastoResponseDTO>> obtenerGastosPorPareja(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PageableDefault(size = 20) Pageable pageable) {

        Long parejaId = parejaService.obtenerParejaDelUsuario(currentUser.getId()).getId();
        Page<GastoResponseDTO> gastos = gastoService.obtenerGastosPorParejaPaginado(parejaId, pageable);
        return ResponseEntity.ok(gastos);
    }

    @GetMapping("/pareja/mes")
    @Operation(summary = "Obtener gastos del mes", description = "Lista los gastos de la pareja para un mes específico")
    public ResponseEntity<List<GastoResponseDTO>> obtenerGastosPorMes(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam int ano,
            @RequestParam int mes) {

        Long parejaId = parejaService.obtenerParejaDelUsuario(currentUser.getId()).getId();
        List<GastoResponseDTO> gastos = gastoService.obtenerGastosPorParejaYMes(parejaId, ano, mes);
        return ResponseEntity.ok(gastos);
    }

    @DeleteMapping("/{gastoId}")
    @Operation(summary = "Eliminar un gasto", description = "Elimina un gasto (solo el usuario que lo registró puede hacerlo)")
    public ResponseEntity<?> eliminarGasto(
            @PathVariable Long gastoId,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {

        GastoResponseDTO gastoAntes = gastoService.obtenerGasto(gastoId);
        gastoService.eliminarGasto(gastoId, currentUser.getId());
        auditService.registrar(currentUser.getId(), AuditAction.DELETE, "gastos",
                gastoId, gastoAntes, null, "Gasto eliminado", httpRequest);
        return ResponseEntity.noContent().build();
    }
}
