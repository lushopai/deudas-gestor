package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.Pareja;
import com.gastos.gastos_compartidos.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParejaResponseDTO {

    private Long id;
    private String nombrePareja;
    private String codigoInvitacion;
    private int cantidadMiembros;
    private List<UsuarioSimpleDTO> usuarios;
    private LocalDateTime fechaCreacion;

    public static ParejaResponseDTO fromEntity(Pareja pareja) {
        return ParejaResponseDTO.builder()
            .id(pareja.getId())
            .nombrePareja(pareja.getNombrePareja())
            .codigoInvitacion(pareja.getCodigoInvitacion())
            .cantidadMiembros(pareja.getUsuarios().size())
            .usuarios(pareja.getUsuarios().stream()
                .map(UsuarioSimpleDTO::fromEntity)
                .collect(Collectors.toList()))
            .fechaCreacion(pareja.getFechaCreacion())
            .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UsuarioSimpleDTO {
        private Long id;
        private String nombre;
        private String email;
        private String fotoPerfil;

        public static UsuarioSimpleDTO fromEntity(Usuario usuario) {
            return UsuarioSimpleDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .fotoPerfil(usuario.getFotoPerfil())
                .build();
        }
    }
}
