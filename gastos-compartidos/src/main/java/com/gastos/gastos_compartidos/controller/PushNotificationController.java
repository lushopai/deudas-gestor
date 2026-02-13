package com.gastos.gastos_compartidos.controller;

import com.gastos.gastos_compartidos.entity.Usuario;
import com.gastos.gastos_compartidos.service.UsuarioService;
import com.gastos.gastos_compartidos.service.WebPushService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
@Tag(name = "Push Notifications", description = "Gestión de notificaciones push")
public class PushNotificationController {

    private final WebPushService webPushService;
    private final UsuarioService usuarioService;

    @GetMapping("/vapid-key")
    @Operation(summary = "Obtener clave pública VAPID", description = "Necesaria para que el navegador se suscriba a push notifications")
    public ResponseEntity<?> getVapidKey() {
        String key = webPushService.getVapidPublicKey();
        if (key == null || key.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "enabled", false,
                    "message", "Push notifications no configuradas"));
        }
        return ResponseEntity.ok(Map.of(
                "enabled", true,
                "publicKey", key));
    }

    @PostMapping("/subscribe")
    @Operation(summary = "Suscribirse a push notifications")
    public ResponseEntity<?> subscribe(@RequestBody SubscribeRequest request, Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        Usuario usuario = usuarioService.obtenerPorId(userId);

        webPushService.subscribe(
                usuario,
                request.endpoint(),
                request.keys().p256dh(),
                request.keys().auth());

        return ResponseEntity.ok(Map.of("mensaje", "Suscripción registrada"));
    }

    @PostMapping("/unsubscribe")
    @Operation(summary = "Desuscribirse de push notifications")
    public ResponseEntity<?> unsubscribe(@RequestBody Map<String, String> request) {
        String endpoint = request.get("endpoint");
        if (endpoint != null) {
            webPushService.unsubscribe(endpoint);
        }
        return ResponseEntity.ok(Map.of("mensaje", "Suscripción eliminada"));
    }

    @PostMapping("/test")
    @Operation(summary = "Enviar notificación de prueba")
    public ResponseEntity<?> testNotification(Authentication auth) {
        if (!webPushService.isEnabled()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "mensaje", "Push notifications no están habilitadas"));
        }

        Long userId = Long.parseLong(auth.getName());
        webPushService.notifyUser(userId,
                "¡Prueba exitosa! 🎉",
                "Las notificaciones push están funcionando correctamente",
                "/dashboard");

        return ResponseEntity.ok(Map.of("mensaje", "Notificación de prueba enviada"));
    }

    // Records para el request body
    public record SubscribeRequest(String endpoint, SubscribeKeys keys) {
    }

    public record SubscribeKeys(String p256dh, String auth) {
    }
}
