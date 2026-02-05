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
    private String telefono;
    private String bio;
    private String provider;
    private Long parejaId;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        return UsuarioResponseDTO.builder()
            .id(usuario.getId())
            .email(usuario.getEmail())
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .fotoPerfil(usuario.getFotoPerfil())
            .telefono(usuario.getTelefono())
            .bio(usuario.getBio())
            .provider(usuario.getProvider() != null ? usuario.getProvider().name() : null)
            .parejaId(usuario.getPareja() != null ? usuario.getPareja().getId() : null)
            .fechaCreacion(usuario.getFechaCreacion())
            .fechaActualizacion(usuario.getFechaActualizacion())
            .build();
    }
}
