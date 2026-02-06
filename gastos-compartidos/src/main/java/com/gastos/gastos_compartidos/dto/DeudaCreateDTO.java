package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.TipoDeuda;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DeudaCreateDTO {

    @NotBlank(message = "El acreedor es requerido")
    @Size(max = 100, message = "El acreedor no puede exceder 100 caracteres")
    private String acreedor;

    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String descripcion;

    @NotNull(message = "El tipo de deuda es requerido")
    private TipoDeuda tipo;

    @NotNull(message = "El monto es requerido")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Digits(integer = 10, fraction = 2, message = "El monto debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal montoOriginal;

    private LocalDate fechaInicio;

    private LocalDate fechaVencimiento;

    @Min(value = 1, message = "El día de corte debe estar entre 1 y 31")
    @Max(value = 31, message = "El día de corte debe estar entre 1 y 31")
    private Integer diaCorte;

    @Min(value = 1, message = "El día límite debe estar entre 1 y 31")
    @Max(value = 31, message = "El día límite debe estar entre 1 y 31")
    private Integer diaLimitePago;

    @DecimalMin(value = "0", message = "La tasa de interés no puede ser negativa")
    @DecimalMax(value = "100", message = "La tasa de interés no puede ser mayor a 100%")
    private BigDecimal tasaInteres;
}
