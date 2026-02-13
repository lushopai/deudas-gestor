package com.gastos.gastos_compartidos.repository;

import com.gastos.gastos_compartidos.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    List<PushSubscription> findByUsuarioId(Long usuarioId);

    Optional<PushSubscription> findByEndpoint(String endpoint);

    void deleteByEndpoint(String endpoint);

    void deleteByUsuarioId(Long usuarioId);
}
