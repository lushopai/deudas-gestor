package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.GastoSplit;
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
public class GastoSplitDTO {

    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private BigDecimal monto;
    private String tipo; // DEBE o PAGO
    private LocalDateTime fechaCreacion;

    public static GastoSplitDTO fromEntity(GastoSplit split) {
        return GastoSplitDTO.builder()
            .id(split.getId())
            .usuarioId(split.getUsuario().getId())
            .usuarioNombre(split.getUsuario().getNombre())
            .monto(split.getMonto())
            .tipo(split.getTipo().toString())
            .fechaCreacion(split.getFechaCreacion())
            .build();
    }
}
