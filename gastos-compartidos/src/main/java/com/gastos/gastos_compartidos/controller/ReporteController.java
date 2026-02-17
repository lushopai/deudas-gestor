package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.dto.ReporteDTO;
import com.gastos.gastos_compartidos.security.CustomUserDetails;
import com.gastos.gastos_compartidos.service.ExportService;
import com.gastos.gastos_compartidos.service.ReporteService;
import com.gastos.gastos_compartidos.service.ParejaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@Tag(name = "Reportes", description = "Generación de reportes y análisis de gastos")
@SecurityRequirement(name = "bearer-jwt")
public class ReporteController {

        private final ReporteService reporteService;
        private final ParejaService parejaService;
        private final ExportService exportService;

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

        @GetMapping("/exportar/pdf")
        @Operation(summary = "Exportar gastos a PDF", description = "Genera un archivo PDF con los gastos del período indicado")
        public ResponseEntity<byte[]> exportarPdf(
                        @AuthenticationPrincipal CustomUserDetails currentUser,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

                Long parejaId = parejaService.obtenerParejaDelUsuario(currentUser.getId()).getId();
                byte[] pdf = exportService.generarPdfGastos(parejaId, desde, hasta);

                String filename = "gastos_" + desde.format(DateTimeFormatter.BASIC_ISO_DATE)
                                + "_" + hasta.format(DateTimeFormatter.BASIC_ISO_DATE) + ".pdf";

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                                .contentType(MediaType.APPLICATION_PDF)
                                .body(pdf);
        }

        @GetMapping("/exportar/excel")
        @Operation(summary = "Exportar gastos a Excel", description = "Genera un archivo Excel con los gastos del período indicado")
        public ResponseEntity<byte[]> exportarExcel(
                        @AuthenticationPrincipal CustomUserDetails currentUser,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta)
                        throws IOException {

                Long parejaId = parejaService.obtenerParejaDelUsuario(currentUser.getId()).getId();
                byte[] excel = exportService.generarExcelGastos(parejaId, desde, hasta);

                String filename = "gastos_" + desde.format(DateTimeFormatter.BASIC_ISO_DATE)
                                + "_" + hasta.format(DateTimeFormatter.BASIC_ISO_DATE) + ".xlsx";

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                                .contentType(MediaType.parseMediaType(
                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .body(excel);
        }

        @GetMapping("/tendencia")
        @Operation(summary = "Tendencia mensual", description = "Devuelve totales de gasto por mes de los últimos N meses")
        public ResponseEntity<?> obtenerTendencia(
                        @AuthenticationPrincipal CustomUserDetails currentUser,
                        @RequestParam(defaultValue = "6") int meses) {

                Long parejaId = parejaService.obtenerParejaDelUsuario(currentUser.getId()).getId();

                java.util.List<java.util.Map<String, Object>> tendencia = new java.util.ArrayList<>();

                for (int i = meses - 1; i >= 0; i--) {
                        java.time.YearMonth ym = java.time.YearMonth.now().minusMonths(i);
                        LocalDate inicio = ym.atDay(1);
                        LocalDate fin = ym.atEndOfMonth();

                        java.util.List<com.gastos.gastos_compartidos.entity.Gasto> gastos = reporteService
                                        .obtenerGastosPorRango(parejaId,
                                                        inicio.atStartOfDay(), fin.atTime(23, 59, 59));

                        java.math.BigDecimal total = gastos.stream()
                                        .map(com.gastos.gastos_compartidos.entity.Gasto::getMonto)
                                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                        tendencia.add(java.util.Map.of(
                                        "mes", ym.getMonthValue(),
                                        "anio", ym.getYear(),
                                        "nombreMes",
                                        ym.getMonth().getDisplayName(java.time.format.TextStyle.SHORT,
                                                        new java.util.Locale("es", "CL")),
                                        "total", total,
                                        "cantidadGastos", gastos.size()));
                }

                return ResponseEntity.ok(tendencia);
        }
}
