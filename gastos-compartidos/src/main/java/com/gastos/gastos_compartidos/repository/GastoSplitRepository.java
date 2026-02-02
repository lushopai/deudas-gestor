package com.gastos.gastos_compartidos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gastos.gastos_compartidos.entity.GastoSplit;

@Repository
public interface GastoSplitRepository extends JpaRepository<GastoSplit, Long> {

    @Query("SELECT gs FROM GastoSplit gs WHERE gs.gasto.id = :gastoId")
    List<GastoSplit> findByGastoid(@Param("gastoId") Long gastoId);

    @Query("SELECT gs FROM GastoSplit gs WHERE gs.usuario.id = :usuarioId")
    List<GastoSplit> findByUsuarioid(@Param("usuarioId") Long usuarioId);

    @Query("SELECT gs FROM GastoSplit gs WHERE gs.usuario.id = :usuarioId AND gs.gasto.pareja.id = :parejaId")
    List<GastoSplit> findByUsuarioidAndGastoParejaId(
        @Param("usuarioId") Long usuarioId,
        @Param("parejaId") Long parejaId
    );
}
