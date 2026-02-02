package com.gastos.gastos_compartidos.repository;

import com.gastos.gastos_compartidos.entity.Pareja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParejaRepository extends JpaRepository<Pareja, Long> {

    Optional<Pareja> findByCodigoInvitacion(String codigoInvitacion);
}
