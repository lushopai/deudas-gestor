package com.gastos.gastos_compartidos.repository;

import com.gastos.gastos_compartidos.entity.GastoRecurrente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface GastoRecurrenteRepository extends JpaRepository<GastoRecurrente, Long> {

    // Gastos recurrentes de un usuario
    List<GastoRecurrente> findByUsuarioIdOrderByProximaEjecucionAsc(Long usuarioId);

    // Gastos recurrentes activos de un usuario
    List<GastoRecurrente> findByUsuarioIdAndActivoTrueOrderByProximaEjecucionAsc(Long usuarioId);

    // Gastos que deben ejecutarse (próxima ejecución <= hoy y activos)
    @Query("SELECT g FROM GastoRecurrente g WHERE g.activo = true AND g.proximaEjecucion <= :fecha")
    List<GastoRecurrente> findPendientesDeEjecutar(@Param("fecha") LocalDate fecha);

    // Contar activos por usuario
    long countByUsuarioIdAndActivoTrue(Long usuarioId);

    // Gastos recurrentes que vencen pronto (próximos N días)
    @Query("SELECT g FROM GastoRecurrente g WHERE g.usuario.id = :usuarioId AND g.activo = true AND g.proximaEjecucion BETWEEN :desde AND :hasta ORDER BY g.proximaEjecucion ASC")
    List<GastoRecurrente> findProximosAEjecutar(
            @Param("usuarioId") Long usuarioId,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}
