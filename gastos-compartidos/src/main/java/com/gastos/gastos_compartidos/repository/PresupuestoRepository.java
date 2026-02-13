package com.gastos.gastos_compartidos.repository;

import com.gastos.gastos_compartidos.entity.PeriodoPresupuesto;
import com.gastos.gastos_compartidos.entity.Presupuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {

    List<Presupuesto> findByUsuarioIdAndActivoTrue(Long usuarioId);

    List<Presupuesto> findByUsuarioId(Long usuarioId);

    Optional<Presupuesto> findByUsuarioIdAndCategoriaIdAndPeriodo(
            Long usuarioId, Long categoriaId, PeriodoPresupuesto periodo);

    Optional<Presupuesto> findByUsuarioIdAndCategoriaIsNullAndPeriodo(
            Long usuarioId, PeriodoPresupuesto periodo);
}
