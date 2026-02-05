package com.gastos.gastos_compartidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteDTO {

    private Long parejaId;
    private String nombrePareja;
    private String nombreUsuario1;
    private String nombreUsuario2;
    private BigDecimal gastoTotalMes;
    private BigDecimal gastoUsuario1;
    private BigDecimal gastoUsuario2;
    private BigDecimal pagadoUsuario1;
    private BigDecimal pagadoUsuario2;
    private BigDecimal saldoQuienDebe;
    private String detalleDeuda;
    private int cantidadGastos;
    private List<CategoriaReporte> gastosPorCategoria;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoriaReporte {
        private String nombre;
        private String icono;
        private String color;
        private BigDecimal monto;
        private int cantidad;
        private double porcentaje;
    }
}
