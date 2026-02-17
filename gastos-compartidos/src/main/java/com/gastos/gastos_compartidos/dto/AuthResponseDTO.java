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
    private String refreshToken;

    @Default
    private String tipo = "Bearer";
    private UsuarioResponseDTO usuario;

    public static AuthResponseDTO fromUsuario(String token, String refreshToken, Usuario usuario) {
        return AuthResponseDTO.builder()
                .token(token)
                .refreshToken(refreshToken)
                .usuario(UsuarioResponseDTO.fromEntity(usuario))
                .build();
    }
}
