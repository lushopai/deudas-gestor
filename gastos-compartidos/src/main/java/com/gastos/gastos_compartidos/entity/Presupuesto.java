package com.gastos.gastos_compartidos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "presupuestos", uniqueConstraints = @UniqueConstraint(columnNames = { "usuario_id", "categoria_id",
        "periodo" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Presupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria; // null = presupuesto global

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal limite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PeriodoPresupuesto periodo;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column
    private String notas;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
