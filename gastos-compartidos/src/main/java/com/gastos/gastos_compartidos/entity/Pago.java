package com.gastos.gastos_compartidos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pagador_id", nullable = false)
    private Usuario pagador;  // Quien paga

    @ManyToOne
    @JoinColumn(name = "receptor_id", nullable = false)
    private Usuario receptor;  // Quien recibe

    @ManyToOne
    @JoinColumn(name = "pareja_id", nullable = false)
    private Pareja pareja;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(length = 500)
    private String concepto;  // "Abono deudas enero 2025"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MetodoPago metodoPago = MetodoPago.EFECTIVO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoPago estado = EstadoPago.COMPLETADO;

    @Column(nullable = false)
    private LocalDateTime fechaPago;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    // Para filtrar por periodo
    @Column
    private Integer mesPago;

    @Column
    private Integer anoPago;

    @PrePersist
    protected void onCreate() {
        if (fechaPago == null) {
            fechaPago = LocalDateTime.now();
        }
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();

        // Extraer mes y año de fechaPago
        mesPago = fechaPago.getMonthValue();
        anoPago = fechaPago.getYear();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();

        // Actualizar mes y año si fechaPago cambió
        if (fechaPago != null) {
            mesPago = fechaPago.getMonthValue();
            anoPago = fechaPago.getYear();
        }
    }
}
