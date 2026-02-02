package com.gastos.gastos_compartidos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gastos.gastos_compartidos.dto.GastoCreateDTO;
import com.gastos.gastos_compartidos.dto.GastoResponseDTO;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import com.gastos.gastos_compartidos.service.GastoService;
import com.gastos.gastos_compartidos.service.ParejaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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

    @PostMapping
    @Operation(summary = "Crear nuevo gasto", description = "Registra un nuevo gasto con su división entre usuarios")
    public ResponseEntity<GastoResponseDTO> crearGasto(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody GastoCreateDTO request) {
        
        GastoResponseDTO gasto = gastoService.crearGasto(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(gasto);
    }

    @GetMapping("/{gastoId}")
    @Operation(summary = "Obtener detalles de un gasto", description = "Obtiene la información completa de un gasto específico")
    public ResponseEntity<GastoResponseDTO> obtenerGasto(@PathVariable Long gastoId) {
        GastoResponseDTO gasto = gastoService.obtenerGasto(gastoId);
        return ResponseEntity.ok(gasto);
    }

    @GetMapping
    @Operation(summary = "Obtener gastos del usuario", description = "Lista todos los gastos del usuario autenticado")
    public ResponseEntity<List<GastoResponseDTO>> obtenerGastosDelUsuario(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        List<GastoResponseDTO> gastos = gastoService.obtenerGastosPorUsuario(currentUser.getId());
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
    @Operation(summary = "Obtener gastos de la pareja", description = "Lista todos los gastos de la pareja del usuario autenticado")
    public ResponseEntity<List<GastoResponseDTO>> obtenerGastosPorPareja(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        Long parejaId = parejaService.obtenerParejaDelUsuario(currentUser.getId()).getId();
        List<GastoResponseDTO> gastos = gastoService.obtenerGastosPorPareja(parejaId);
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
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        gastoService.eliminarGasto(gastoId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
