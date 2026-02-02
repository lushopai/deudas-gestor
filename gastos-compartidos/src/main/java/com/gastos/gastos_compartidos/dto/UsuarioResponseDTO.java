package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponseDTO {

    private Long id;
    private String email;
    private String nombre;
    private String apellido;
    private String fotoPerfil;
    private Long parejaId;
    private LocalDateTime fechaCreacion;

    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        return UsuarioResponseDTO.builder()
            .id(usuario.getId())
            .email(usuario.getEmail())
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .fotoPerfil(usuario.getFotoPerfil())
            .parejaId(usuario.getPareja() != null ? usuario.getPareja().getId() : null)
            .fechaCreacion(usuario.getFechaCreacion())
            .build();
    }
}
