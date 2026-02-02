package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.ReporteDTO;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import com.gastos.gastos_compartidos.service.ReporteService;
import com.gastos.gastos_compartidos.service.ParejaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@Tag(name = "Reportes", description = "Generación de reportes y análisis de gastos")
@SecurityRequirement(name = "bearer-jwt")
public class ReporteController {

    private final ReporteService reporteService;
    private final ParejaService parejaService;

    @GetMapping("/mes")
    @Operation(summary = "Reporte mensual", description = "Genera un reporte del mes actual con resumen de gastos y deudas")
    public ResponseEntity<ReporteDTO> obtenerReporteMes(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam int ano,
            @RequestParam int mes) {
        
        Long parejaId = parejaService.obtenerParejaDelUsuario(currentUser.getId()).getId();
        ReporteDTO reporte = reporteService.generarReporteMensual(parejaId, ano, mes);
        return ResponseEntity.ok(reporte);
    }
}
