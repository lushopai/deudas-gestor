package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.Categoria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaDTO {

    private Long id;
    private String nombre;
    private String icono;
    private String color;
    private boolean activo;

    public static CategoriaDTO fromEntity(Categoria categoria) {
        return CategoriaDTO.builder()
            .id(categoria.getId())
            .nombre(categoria.getNombre())
            .icono(categoria.getIcono())
            .color(categoria.getColor())
            .activo(categoria.isActivo())
            .build();
    }
}
