package com.gastos.gastos_compartidos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gasto_splits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GastoSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gasto_id", nullable = false)
    private Gasto gasto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; // Usuario que debe pagar o que paga parte

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto; // Cuánto debe pagar o pagó este usuario

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TipoSplit tipo = TipoSplit.DEBE; // DEBE o PAGÓ

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }

    public enum TipoSplit {
        DEBE,  // Usuario debe pagar esto
        PAGO   // Usuario ya pagó esto
    }
}
