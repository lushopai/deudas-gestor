package com.gastos.gastos_compartidos.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "audit_log", indexes = {
        @Index(name = "idx_usuario", columnList = "usuario_id"),
        @Index(name = "idx_tabla", columnList = "tabla_nombre"),
        @Index(name = "idx_fecha", columnList = "fecha_hora"),
        @Index(name = "idx_usuario_fecha", columnList = "usuario_id, fecha_hora")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AuditAction accion;

    @Column(nullable = false, length = 50)
    private String tablaNombre;

    private Long registroId;

    @Column(columnDefinition = "TEXT")
    private String datosAntes;

    @Column(columnDefinition = "TEXT")
    private String datosDespues;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 45)
    private String ipOrigen;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaHora;
}
