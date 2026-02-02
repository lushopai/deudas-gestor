package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private String token;

    @Default
    private String tipo = "Bearer";
    private UsuarioResponseDTO usuario;

    public static AuthResponseDTO fromUsuario(String token, Usuario usuario) {
        return AuthResponseDTO.builder()
            .token(token)
            .usuario(UsuarioResponseDTO.fromEntity(usuario))
            .build();
    }
}
