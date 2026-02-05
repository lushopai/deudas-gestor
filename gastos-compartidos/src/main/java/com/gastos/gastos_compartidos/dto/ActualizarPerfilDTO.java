package com.gastos.gastos_compartidos.dto;

import lombok.Data;

@Data
public class ActualizarPerfilDTO {
    private String nombre;
    private String apellido;
    private String telefono;
    private String bio;
    private String fotoPerfil;
}
