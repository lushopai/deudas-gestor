package com.gastos.gastos_compartidos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categorias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column
    private String icono; // Icono de categoria

    @Column
    private String color;

    @Builder.Default
    @Column(columnDefinition = "boolean default true")
    private boolean activo = true;

    public Categoria(String nombre, String icono) {
        this.nombre = nombre;
        this.icono = icono;
        this.activo = true;
    }
}
