package com.gastos.gastos_compartidos.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gastos.gastos_compartidos.entity.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    /**
     * Obtiene todas las acciones de un usuario
     */
    List<AuditLog> findByUsuarioIdOrderByFechaHoraDesc(Long usuarioId);
    
    /**
     * Obtiene acciones de un usuario paginadas, últimas primero
     */
    Page<AuditLog> findByUsuarioIdOrderByFechaHoraDesc(Long usuarioId, Pageable pageable);
    
    /**
     * Obtiene acciones en una tabla específica
     */
    List<AuditLog> findByTablaNombreOrderByFechaHoraDesc(String tablaNombre);
    
    /**
     * Obtiene acciones en un rango de fechas
     */
    @Query("SELECT a FROM AuditLog a WHERE a.fechaHora BETWEEN :inicio AND :fin ORDER BY a.fechaHora DESC")
    List<AuditLog> findByDateRange(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
    
    /**
     * Obtiene acciones de un usuario en un rango de fechas
     */
    @Query("SELECT a FROM AuditLog a WHERE a.usuarioId = :usuarioId AND a.fechaHora BETWEEN :inicio AND :fin ORDER BY a.fechaHora DESC")
    List<AuditLog> findByUsuarioIdAndDateRange(
        @Param("usuarioId") Long usuarioId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin
    );
    
    /**
     * Contador de acciones por usuario y tipo
     */
    long countByUsuarioIdAndAccion(Long usuarioId, String accion);
}
