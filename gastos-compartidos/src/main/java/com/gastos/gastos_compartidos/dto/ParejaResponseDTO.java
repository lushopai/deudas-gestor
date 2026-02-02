package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.Pareja;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParejaResponseDTO {

    private Long id;
    private String nombrePareja;
    private String codigoInvitacion;
    private int cantidadMiembros;
    private LocalDateTime fechaCreacion;

    public static ParejaResponseDTO fromEntity(Pareja pareja) {
        return ParejaResponseDTO.builder()
            .id(pareja.getId())
            .nombrePareja(pareja.getNombrePareja())
            .codigoInvitacion(pareja.getCodigoInvitacion())
            .cantidadMiembros(pareja.getUsuarios().size())
            .fechaCreacion(pareja.getFechaCreacion())
            .build();
    }
}
