package com.gastos.gastos_compartidos.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gastos")
@SQLDelete(sql = "UPDATE gastos SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montoOriginal; // El monto total antes de splits

    @Column
    private String notas;

    @Column
    private String rutaFoto; // Para foto de boleta

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; // Quien registra el gasto

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pareja_id", nullable = true) // Ahora es opcional - permite gastos individuales
    private Pareja pareja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Builder.Default
    @OneToMany(mappedBy = "gasto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GastoSplit> splits = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @Column(nullable = false)
    private LocalDateTime fechaGasto;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (montoOriginal == null) {
            montoOriginal = monto;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
