package com.gastos.gastos_compartidos.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gastos.gastos_compartidos.entity.Gasto;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {

    @Query("SELECT g FROM Gasto g WHERE g.pareja.id = :parejaId")
    List<Gasto> findByParejaid(@Param("parejaId") Long parejaId);

    @Query("SELECT g FROM Gasto g WHERE g.pareja.id = :parejaId ORDER BY g.fechaGasto DESC")
    List<Gasto> findByParejaidOrderByFechaGastoDesc(@Param("parejaId") Long parejaId);

    @Query("SELECT g FROM Gasto g WHERE g.pareja.id = :parejaId AND g.fechaGasto >= :inicio AND g.fechaGasto <= :fin ORDER BY g.fechaGasto DESC")
    List<Gasto> findByParejaidAndFechaRango(
            @Param("parejaId") Long parejaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);

    @Query("SELECT g FROM Gasto g WHERE g.usuario.id = :usuarioId AND g.pareja.id = :parejaId")
    List<Gasto> findByUsuarioidAndParejaid(@Param("usuarioId") Long usuarioId, @Param("parejaId") Long parejaId);

    // Buscar gastos individuales (sin pareja) de un usuario
    @Query("SELECT g FROM Gasto g WHERE g.usuario.id = :usuarioId AND g.pareja IS NULL ORDER BY g.fechaGasto DESC")
    List<Gasto> findByUsuarioIdAndParejaIsNullOrderByFechaGastoDesc(@Param("usuarioId") Long usuarioId);

    List<Gasto> findByCategoriaId(Long categoriaId);

    // === Paginated queries ===

    @Query("SELECT g FROM Gasto g WHERE (g.usuario.id = :usuarioId AND g.pareja IS NULL) OR (:parejaId IS NOT NULL AND g.pareja.id = :parejaId) ORDER BY g.fechaGasto DESC")
    Page<Gasto> findGastosDelUsuario(@Param("usuarioId") Long usuarioId, @Param("parejaId") Long parejaId,
            Pageable pageable);

    @Query("SELECT g FROM Gasto g WHERE g.pareja.id = :parejaId ORDER BY g.fechaGasto DESC")
    Page<Gasto> findByParejaidPaginado(@Param("parejaId") Long parejaId, Pageable pageable);

    // === Budget queries ===

    @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.usuario.id = :usuarioId " +
            "AND g.categoria.id = :categoriaId " +
            "AND g.fechaGasto >= :desde AND g.fechaGasto < :hasta")
    java.math.BigDecimal sumarGastosPorCategoriaYRango(
            @Param("usuarioId") Long usuarioId,
            @Param("categoriaId") Long categoriaId,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta);

    @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.usuario.id = :usuarioId " +
            "AND g.fechaGasto >= :desde AND g.fechaGasto < :hasta")
    java.math.BigDecimal sumarGastosTotalPorRango(
            @Param("usuarioId") Long usuarioId,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta);
}
