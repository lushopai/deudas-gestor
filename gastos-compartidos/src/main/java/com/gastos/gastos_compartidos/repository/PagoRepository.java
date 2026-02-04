package com.gastos.gastos_compartidos.repository;

import com.gastos.gastos_compartidos.entity.Pago;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    // Obtener todos los pagos de una pareja ordenados por fecha descendente
    @Query("SELECT p FROM Pago p WHERE p.pareja.id = :parejaId AND p.estado = 'COMPLETADO' ORDER BY p.fechaPago DESC")
    List<Pago> findByParejaIdOrderByFechaPagoDesc(@Param("parejaId") Long parejaId);

    // Obtener pagos por periodo (mes y año)
    @Query("SELECT p FROM Pago p WHERE p.pareja.id = :parejaId AND p.anoPago = :ano AND p.mesPago = :mes AND p.estado = 'COMPLETADO' ORDER BY p.fechaPago DESC")
    List<Pago> findByParejaIdAndAnoPagoAndMesPago(
            @Param("parejaId") Long parejaId,
            @Param("ano") Integer ano,
            @Param("mes") Integer mes);

    // Obtener pagos donde el usuario es pagador o receptor
    @Query("SELECT p FROM Pago p WHERE (p.pagador.id = :usuarioId OR p.receptor.id = :usuarioId) AND p.estado = 'COMPLETADO' ORDER BY p.fechaPago DESC")
    List<Pago> findByPagadorIdOrReceptorId(@Param("usuarioId") Long usuarioId);

    // Obtener pagos de una pareja donde el usuario es pagador
    @Query("SELECT p FROM Pago p WHERE p.pareja.id = :parejaId AND p.pagador.id = :usuarioId AND p.estado = 'COMPLETADO'")
    List<Pago> findByParejaIdAndPagadorId(
            @Param("parejaId") Long parejaId,
            @Param("usuarioId") Long usuarioId);

    // Obtener últimos N pagos de una pareja
    @Query("SELECT p FROM Pago p WHERE p.pareja.id = :parejaId AND p.estado = 'COMPLETADO' ORDER BY p.fechaPago DESC")
    List<Pago> findTopByParejaIdOrderByFechaPagoDesc(
            @Param("parejaId") Long parejaId,
            Pageable pageable);
}
