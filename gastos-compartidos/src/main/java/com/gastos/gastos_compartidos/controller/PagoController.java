package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.PagoCreateDTO;
import com.gastos.gastos_compartidos.dto.PagoResponseDTO;
import com.gastos.gastos_compartidos.dto.ResumenDeudaDTO;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import com.gastos.gastos_compartidos.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@Tag(name = "Pagos", description = "Gestión de pagos y abonos entre usuarios")
@SecurityRequirement(name = "bearer-jwt")
public class PagoController {

    private final PagoService pagoService;

    @PostMapping
    @Operation(summary = "Registrar un pago", description = "Registra un pago/abono de un usuario a otro de la misma pareja")
    public ResponseEntity<PagoResponseDTO> registrarPago(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody PagoCreateDTO request) {

        PagoResponseDTO pago = pagoService.registrarPago(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pago);
    }

    @GetMapping
    @Operation(summary = "Obtener historial de pagos", description = "Obtiene todos los pagos de la pareja del usuario autenticado")
    public ResponseEntity<List<PagoResponseDTO>> obtenerHistorialPagos(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        List<PagoResponseDTO> pagos = pagoService.obtenerHistorialPagos(currentUser.getId());
        return ResponseEntity.ok(pagos);
    }

    @GetMapping("/{pagoId}")
    @Operation(summary = "Obtener pago por ID", description = "Obtiene los detalles de un pago específico")
    public ResponseEntity<PagoResponseDTO> obtenerPagoPorId(
            @PathVariable Long pagoId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        PagoResponseDTO pago = pagoService.obtenerPagoPorId(pagoId, currentUser.getId());
        return ResponseEntity.ok(pago);
    }

    @DeleteMapping("/{pagoId}")
    @Operation(summary = "Cancelar pago", description = "Cancela un pago (solo dentro de los 7 días posteriores)")
    public ResponseEntity<Void> cancelarPago(
            @PathVariable Long pagoId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        pagoService.cancelarPago(pagoId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/resumen")
    @Operation(summary = "Obtener resumen de deuda", description = "Calcula y retorna el balance completo de deudas de la pareja")
    public ResponseEntity<ResumenDeudaDTO> obtenerResumenDeuda(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ResumenDeudaDTO resumen = pagoService.calcularResumenDeuda(currentUser.getId());
        return ResponseEntity.ok(resumen);
    }
}
