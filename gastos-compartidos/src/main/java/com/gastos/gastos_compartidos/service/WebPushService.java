package com.gastos.gastos_compartidos.service;

import com.gastos.gastos_compartidos.entity.PushSubscription;
import com.gastos.gastos_compartidos.entity.Usuario;
import com.gastos.gastos_compartidos.repository.PushSubscriptionRepository;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Servicio de Web Push Notifications con VAPID keys.
 * Las VAPID keys se configuran en application.properties.
 * Para generar un par de claves, usar: npx web-push generate-vapid-keys
 */
@Service
@Slf4j
public class WebPushService {

    private final PushSubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;

    @Value("${push.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${push.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${push.vapid.subject:mailto:admin@gastoscompartidos.app}")
    private String vapidSubject;

    private PushService pushService;
    private boolean pushEnabled = false;

    public WebPushService(PushSubscriptionRepository subscriptionRepository, ObjectMapper objectMapper) {
        this.subscriptionRepository = subscriptionRepository;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        if (vapidPublicKey.isEmpty() || vapidPrivateKey.isEmpty()) {
            log.warn("Push notifications deshabilitadas: VAPID keys no configuradas. " +
                    "Generar con: npx web-push generate-vapid-keys");
            return;
        }

        try {
            Security.addProvider(new BouncyCastleProvider());
            pushService = new PushService();
            pushService.setPublicKey(vapidPublicKey);
            pushService.setPrivateKey(vapidPrivateKey);
            pushService.setSubject(vapidSubject);
            pushEnabled = true;
            log.info("Push notifications habilitadas");
        } catch (GeneralSecurityException e) {
            log.error("Error al inicializar Push Service: {}", e.getMessage());
        }
    }

    /**
     * Devuelve la clave pública VAPID para que el frontend la use al suscribirse.
     */
    public String getVapidPublicKey() {
        return vapidPublicKey;
    }

    public boolean isEnabled() {
        return pushEnabled;
    }

    /**
     * Registra una suscripción push para un usuario.
     */
    @Transactional
    public PushSubscription subscribe(Usuario usuario, String endpoint, String p256dhKey, String authKey) {
        // Verificar si ya existe esta suscripción
        return subscriptionRepository.findByEndpoint(endpoint)
                .map(existing -> {
                    // Actualizar claves si cambiaron
                    existing.setP256dhKey(p256dhKey);
                    existing.setAuthKey(authKey);
                    existing.setUsuario(usuario);
                    return subscriptionRepository.save(existing);
                })
                .orElseGet(() -> {
                    PushSubscription sub = PushSubscription.builder()
                            .usuario(usuario)
                            .endpoint(endpoint)
                            .p256dhKey(p256dhKey)
                            .authKey(authKey)
                            .build();
                    return subscriptionRepository.save(sub);
                });
    }

    /**
     * Elimina una suscripción push.
     */
    @Transactional
    public void unsubscribe(String endpoint) {
        subscriptionRepository.deleteByEndpoint(endpoint);
    }

    /**
     * Envía una notificación push a un usuario específico.
     */
    public void notifyUser(Long usuarioId, String title, String body, String url) {
        if (!pushEnabled) {
            log.debug("Push deshabilitado, notificación omitida: {}", title);
            return;
        }

        List<PushSubscription> subscriptions = subscriptionRepository.findByUsuarioId(usuarioId);
        for (PushSubscription sub : subscriptions) {
            sendPush(sub, title, body, url);
        }
    }

    /**
     * Envía una notificación push a todos los suscriptores de una lista de
     * usuarios.
     */
    public void notifyUsers(List<Long> usuarioIds, String title, String body, String url) {
        for (Long userId : usuarioIds) {
            notifyUser(userId, title, body, url);
        }
    }

    private void sendPush(PushSubscription sub, String title, String body, String url) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "notification", Map.of(
                            "title", title,
                            "body", body,
                            "icon", "/assets/icons/icon-128x128.png",
                            "badge", "/assets/icons/icon-72x72.png",
                            "data", Map.of("url", url != null ? url : "/dashboard"),
                            "actions", List.of(
                                    Map.of("action", "open", "title", "Abrir"),
                                    Map.of("action", "dismiss", "title", "Cerrar")))));

            Notification notification = new Notification(
                    sub.getEndpoint(),
                    sub.getP256dhKey(),
                    sub.getAuthKey(),
                    payload);

            pushService.send(notification);

            // Actualizar última notificación
            sub.setUltimaNotificacion(LocalDateTime.now());
            subscriptionRepository.save(sub);

            log.debug("Push enviado a usuario {} (endpoint: {}...)",
                    sub.getUsuario().getId(),
                    sub.getEndpoint().substring(0, Math.min(50, sub.getEndpoint().length())));

        } catch (Exception e) {
            log.warn("Error al enviar push a endpoint {}: {}",
                    sub.getEndpoint().substring(0, Math.min(50, sub.getEndpoint().length())),
                    e.getMessage());
            // Si el endpoint ya no es válido (410 Gone), eliminarlo
            if (e.getMessage() != null && e.getMessage().contains("410")) {
                subscriptionRepository.delete(sub);
                log.info("Suscripción eliminada por endpoint expirado");
            }
        }
    }
}
