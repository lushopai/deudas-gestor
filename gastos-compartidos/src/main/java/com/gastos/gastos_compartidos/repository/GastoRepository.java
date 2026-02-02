package com.gastos.gastos_compartidos.repository;

import java.time.LocalDateTime;
import java.util.List;

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
}
