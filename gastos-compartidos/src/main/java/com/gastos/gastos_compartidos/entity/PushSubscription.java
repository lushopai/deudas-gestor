package com.gastos.gastos_compartidos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "push_subscriptions", uniqueConstraints = @UniqueConstraint(columnNames = { "endpoint" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 1000)
    private String endpoint;

    @Column(nullable = false, length = 500)
    private String p256dhKey;

    @Column(nullable = false, length = 500)
    private String authKey;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column
    private LocalDateTime ultimaNotificacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
