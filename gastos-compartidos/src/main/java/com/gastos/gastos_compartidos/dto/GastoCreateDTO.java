package com.gastos.gastos_compartidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GastoCreateDTO {

    @NotBlank(message = "Descripción es requerida")
    private String descripcion;

    @NotNull(message = "Monto es requerido")
    @Positive(message = "Monto debe ser positivo")
    private BigDecimal monto;

    private String notas;

    private String rutaFoto;

    @NotNull(message = "Categoría es requerida")
    private Long categoriaId;

    @NotNull(message = "Fecha del gasto es requerida")
    private LocalDateTime fechaGasto;

    // Split flexible: Map de usuarioId -> monto que pagó ese usuario
    // Si el usuario que registra pagó todo, su ID tiene el monto total
    // Los demás tienen 0 o lo que aportaron
    @NotNull(message = "Split de gastos es requerido")
    private Map<Long, BigDecimal> split;
}
