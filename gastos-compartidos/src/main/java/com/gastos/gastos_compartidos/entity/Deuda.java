package com.gastos.gastos_compartidos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "deudas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deuda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String acreedor; // "Banco Santander", "Tarjeta Visa", "Juan Pérez"

    @Column(length = 255)
    private String descripcion; // "Tarjeta de crédito principal"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDeuda tipo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montoOriginal;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoPendiente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoDeuda estado = EstadoDeuda.ACTIVA;

    @Column
    private LocalDate fechaInicio; // Cuando se adquirió la deuda

    @Column
    private LocalDate fechaVencimiento; // Fecha límite de pago (opcional)

    @Column
    private Integer diaCorte; // Día del mes para corte (tarjetas)

    @Column
    private Integer diaLimitePago; // Día límite de pago mensual

    @Column(precision = 5, scale = 2)
    private BigDecimal tasaInteres; // Tasa de interés anual (opcional)

    @Builder.Default
    @OneToMany(mappedBy = "deuda", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AbonoDeuda> abonos = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (saldoPendiente == null) {
            saldoPendiente = montoOriginal;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
        // Actualizar estado basado en saldo
        if (saldoPendiente.compareTo(BigDecimal.ZERO) <= 0) {
            estado = EstadoDeuda.PAGADA;
        }
    }

    // Método helper para registrar abono
    public void registrarAbono(BigDecimal monto) {
        this.saldoPendiente = this.saldoPendiente.subtract(monto);
        if (this.saldoPendiente.compareTo(BigDecimal.ZERO) <= 0) {
            this.saldoPendiente = BigDecimal.ZERO;
            this.estado = EstadoDeuda.PAGADA;
        }
    }

    // Calcular progreso de pago (0-100)
    public int calcularProgreso() {
        if (montoOriginal.compareTo(BigDecimal.ZERO) == 0) return 100;
        BigDecimal pagado = montoOriginal.subtract(saldoPendiente);
        return pagado.multiply(BigDecimal.valueOf(100))
                .divide(montoOriginal, 0, java.math.RoundingMode.HALF_UP)
                .intValue();
    }
}
