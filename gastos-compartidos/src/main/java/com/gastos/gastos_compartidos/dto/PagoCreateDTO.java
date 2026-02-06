package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.MetodoPago;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoCreateDTO {

    @NotNull(message = "El receptor del pago es requerido")
    private Long receptorId;  // pagador es el usuario autenticado

    @NotNull(message = "El monto es requerido")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    private String concepto;

    @NotNull(message = "El método de pago es requerido")
    private MetodoPago metodoPago;

    private LocalDateTime fechaPago;  // Si no se especifica, se usa la fecha actual
}
