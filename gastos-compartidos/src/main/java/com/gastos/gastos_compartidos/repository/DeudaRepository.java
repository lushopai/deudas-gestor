package com.gastos.gastos_compartidos.repository;

import com.gastos.gastos_compartidos.entity.Deuda;
import com.gastos.gastos_compartidos.entity.EstadoDeuda;
import com.gastos.gastos_compartidos.entity.TipoDeuda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DeudaRepository extends JpaRepository<Deuda, Long> {

    // Todas las deudas de un usuario
    List<Deuda> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);

    // Deudas activas de un usuario
    List<Deuda> findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(Long usuarioId, EstadoDeuda estado);

    // Deudas por tipo
    List<Deuda> findByUsuarioIdAndTipoOrderByFechaCreacionDesc(Long usuarioId, TipoDeuda tipo);

    // Total de deuda pendiente de un usuario
    @Query("SELECT COALESCE(SUM(d.saldoPendiente), 0) FROM Deuda d WHERE d.usuario.id = :usuarioId AND d.estado = 'ACTIVA'")
    BigDecimal calcularTotalDeudaPendiente(@Param("usuarioId") Long usuarioId);

    // Contar deudas activas
    long countByUsuarioIdAndEstado(Long usuarioId, EstadoDeuda estado);

    // Buscar deudas por acreedor (para autocompletar)
    @Query("SELECT DISTINCT d.acreedor FROM Deuda d WHERE d.usuario.id = :usuarioId AND LOWER(d.acreedor) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<String> buscarAcreedores(@Param("usuarioId") Long usuarioId, @Param("termino") String termino);

    // === Paginated queries ===
    Page<Deuda> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId, Pageable pageable);
    Page<Deuda> findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(Long usuarioId, EstadoDeuda estado, Pageable pageable);
}
