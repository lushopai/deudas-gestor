package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.Frecuencia;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GastoRecurrenteCreateDTO {

    @NotBlank(message = "La descripción es requerida")
    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String descripcion;

    @NotNull(message = "El monto es requerido")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "El monto debe tener máximo 8 dígitos enteros y 2 decimales")
    private BigDecimal monto;

    @NotNull(message = "La categoría es requerida")
    private Long categoriaId;

    @NotNull(message = "La frecuencia es requerida")
    private Frecuencia frecuencia;

    @Min(value = 1, message = "El día debe ser al menos 1")
    @Max(value = 31, message = "El día no puede ser mayor a 31")
    private Integer diaEjecucion;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private Boolean esCompartido = false;

    @Size(max = 500, message = "Las notas no pueden exceder 500 caracteres")
    private String notas;
}
