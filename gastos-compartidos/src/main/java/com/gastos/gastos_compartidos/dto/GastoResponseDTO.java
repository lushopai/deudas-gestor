package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.Gasto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GastoResponseDTO {

    private Long id;
    private String descripcion;
    private BigDecimal monto;
    private BigDecimal montoOriginal;
    private String notas;
    private String rutaFoto;
    private String usuarioNombre;
    private Long usuarioId;
    private String categoriaNombre;
    private Long categoriaId;
    private LocalDateTime fechaGasto;
    private LocalDateTime fechaCreacion;
    private List<GastoSplitDTO> splits;

    public static GastoResponseDTO fromEntity(Gasto gasto) {
        return GastoResponseDTO.builder()
            .id(gasto.getId())
            .descripcion(gasto.getDescripcion())
            .monto(gasto.getMonto())
            .montoOriginal(gasto.getMontoOriginal())
            .notas(gasto.getNotas())
            .rutaFoto(gasto.getRutaFoto())
            .usuarioNombre(gasto.getUsuario().getNombre())
            .usuarioId(gasto.getUsuario().getId())
            .categoriaNombre(gasto.getCategoria() != null ? gasto.getCategoria().getNombre() : null)
            .categoriaId(gasto.getCategoria() != null ? gasto.getCategoria().getId() : null)
            .fechaGasto(gasto.getFechaGasto())
            .fechaCreacion(gasto.getFechaCreacion())
            .splits(gasto.getSplits().stream()
                .map(GastoSplitDTO::fromEntity)
                .collect(Collectors.toList()))
            .build();
    }
}
