package com.gastos.gastos_compartidos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gastos_recurrentes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GastoRecurrente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pareja_id")
    private Pareja pareja;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frecuencia frecuencia;

    @Column(nullable = false)
    private Integer diaEjecucion;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column
    private LocalDate fechaFin;

    @Column
    private LocalDate ultimaEjecucion;

    @Column
    private LocalDate proximaEjecucion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean esCompartido = false;

    @Column(length = 500)
    private String notas;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalEjecutado = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (proximaEjecucion == null) {
            proximaEjecucion = calcularProximaEjecucion(fechaInicio);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    public LocalDate calcularProximaEjecucion(LocalDate desde) {
        if (desde == null)
            desde = LocalDate.now();

        LocalDate proxima;
        switch (frecuencia) {
            case DIARIA:
                proxima = desde.plusDays(1);
                break;
            case SEMANAL:
                proxima = desde.plusWeeks(1);
                break;
            case QUINCENAL:
                proxima = desde.plusWeeks(2);
                break;
            case MENSUAL:
                proxima = ajustarDiaMes(desde.plusMonths(1), diaEjecucion);
                break;
            case BIMESTRAL:
                proxima = ajustarDiaMes(desde.plusMonths(2), diaEjecucion);
                break;
            case TRIMESTRAL:
                proxima = ajustarDiaMes(desde.plusMonths(3), diaEjecucion);
                break;
            case SEMESTRAL:
                proxima = ajustarDiaMes(desde.plusMonths(6), diaEjecucion);
                break;
            case ANUAL:
                proxima = ajustarDiaMes(desde.plusYears(1), diaEjecucion);
                break;
            default:
                proxima = desde.plusMonths(1);
        }

        if (fechaFin != null && proxima.isAfter(fechaFin)) {
            return null;
        }

        return proxima;
    }

    private LocalDate ajustarDiaMes(LocalDate fecha, int dia) {
        int ultimoDia = fecha.lengthOfMonth();
        int diaReal = Math.min(dia, ultimoDia);
        return fecha.withDayOfMonth(diaReal);
    }

    public boolean debeEjecutarseHoy() {
        if (!activo)
            return false;
        if (proximaEjecucion == null)
            return false;
        return !LocalDate.now().isBefore(proximaEjecucion);
    }

    public void marcarEjecutado() {
        this.ultimaEjecucion = LocalDate.now();
        this.proximaEjecucion = calcularProximaEjecucion(LocalDate.now());

        if (this.proximaEjecucion == null) {
            this.activo = false;
        }
    }
}
