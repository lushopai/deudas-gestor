package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.PeriodoPresupuesto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresupuestoResponseDTO {

    private Long id;
    private Long categoriaId;
    private String categoriaNombre;
    private String categoriaIcono;
    private BigDecimal limite;
    private BigDecimal gastado;
    private BigDecimal disponible;
    private double porcentajeUsado;
    private PeriodoPresupuesto periodo;
    private Boolean activo;
    private String notas;
    private String estado; // "OK", "ALERTA", "EXCEDIDO"
}
