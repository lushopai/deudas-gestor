package com.gastos.gastos_compartidos.repository;

import com.gastos.gastos_compartidos.entity.AbonoDeuda;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AbonoDeudaRepository extends JpaRepository<AbonoDeuda, Long> {

    // Abonos de una deuda ordenados por fecha
    List<AbonoDeuda> findByDeudaIdOrderByFechaPagoDesc(Long deudaId);

    // Últimos N abonos de una deuda
    List<AbonoDeuda> findByDeudaIdOrderByFechaPagoDesc(Long deudaId, Pageable pageable);

    // Total abonado a una deuda
    @Query("SELECT COALESCE(SUM(a.monto), 0) FROM AbonoDeuda a WHERE a.deuda.id = :deudaId")
    BigDecimal calcularTotalAbonado(@Param("deudaId") Long deudaId);

    // Abonos de un usuario en un rango de fechas
    @Query("SELECT a FROM AbonoDeuda a WHERE a.deuda.usuario.id = :usuarioId AND a.fechaPago BETWEEN :fechaInicio AND :fechaFin ORDER BY a.fechaPago DESC")
    List<AbonoDeuda> findByUsuarioAndFechaRange(
            @Param("usuarioId") Long usuarioId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );

    // Total abonado por un usuario en un mes
    @Query("SELECT COALESCE(SUM(a.monto), 0) FROM AbonoDeuda a WHERE a.deuda.usuario.id = :usuarioId AND MONTH(a.fechaPago) = :mes AND YEAR(a.fechaPago) = :ano")
    BigDecimal calcularTotalAbonadoMes(@Param("usuarioId") Long usuarioId, @Param("mes") int mes, @Param("ano") int ano);

    // Últimos abonos del usuario (para dashboard)
    @Query("SELECT a FROM AbonoDeuda a WHERE a.deuda.usuario.id = :usuarioId ORDER BY a.fechaPago DESC")
    List<AbonoDeuda> findUltimosAbonosUsuario(@Param("usuarioId") Long usuarioId, Pageable pageable);
}
