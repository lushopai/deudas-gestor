package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.MetodoPago;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AbonoDeudaCreateDTO {

    @NotNull(message = "El monto es requerido")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Digits(integer = 10, fraction = 2, message = "El monto debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal monto;

    private LocalDate fechaPago; // Si no se envía, usa fecha actual

    private MetodoPago metodoPago; // Default: TRANSFERENCIA

    @Size(max = 100, message = "El comprobante no puede exceder 100 caracteres")
    private String comprobante;

    @Size(max = 255, message = "Las notas no pueden exceder 255 caracteres")
    private String notas;
}
