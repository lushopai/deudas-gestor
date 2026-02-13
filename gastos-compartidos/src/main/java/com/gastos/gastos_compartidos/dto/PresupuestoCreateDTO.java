package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.PeriodoPresupuesto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PresupuestoCreateDTO {

    private Long categoriaId; // null = presupuesto global

    @NotNull(message = "El límite es obligatorio")
    @Positive(message = "El límite debe ser positivo")
    private BigDecimal limite;

    @NotNull(message = "El período es obligatorio")
    private PeriodoPresupuesto periodo;

    private String notas;
}
