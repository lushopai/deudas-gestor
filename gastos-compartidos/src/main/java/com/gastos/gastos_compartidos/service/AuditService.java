package com.gastos.gastos_compartidos.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gastos.gastos_compartidos.entity.AuditAction;
import com.gastos.gastos_compartidos.entity.AuditLog;
import com.gastos.gastos_compartidos.repository.AuditLogRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public void registrar(Long usuarioId, AuditAction accion, String tablaNombre,
            Long registroId, Object datosAntes, Object datosDespues,
            String descripcion, HttpServletRequest request) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .usuarioId(usuarioId)
                    .accion(accion)
                    .tablaNombre(tablaNombre)
                    .registroId(registroId)
                    .datosAntes(convertirAJson(datosAntes))
                    .datosDespues(convertirAJson(datosDespues))
                    .descripcion(descripcion)
                    .ipOrigen(extraerIp(request))
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Auditoría: {} - {} en {}", usuarioId, accion, tablaNombre);

        } catch (Exception e) {
            log.error("Error al registrar auditoría", e);
        }
    }

    @Transactional
    public void registrar(Long usuarioId, AuditAction accion, String tablaNombre,
            Long registroId, Object datosAntes, Object datosDespues,
            HttpServletRequest request) {
        registrar(usuarioId, accion, tablaNombre, registroId, datosAntes, datosDespues, null, request);
    }

    public List<AuditLog> obtenerHistorialUsuario(Long usuarioId) {
        return auditLogRepository.findByUsuarioIdOrderByFechaHoraDesc(usuarioId);
    }

    public List<AuditLog> obtenerHistorialTabla(String tablaNombre) {
        return auditLogRepository.findByTablaNombreOrderByFechaHoraDesc(tablaNombre);
    }

    public List<AuditLog> obtenerHistorialRegistro(String tablaNombre, Long registroId) {
        return auditLogRepository.findAll().stream()
                .filter(a -> a.getTablaNombre().equals(tablaNombre) &&
                        a.getRegistroId() != null &&
                        a.getRegistroId().equals(registroId))
                .sorted((a, b) -> b.getFechaHora().compareTo(a.getFechaHora()))
                .toList();
    }

    public List<AuditLog> obtenerPorFecha(LocalDateTime inicio, LocalDateTime fin) {
        return auditLogRepository.findByDateRange(inicio, fin);
    }

    private String convertirAJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Error serializando a JSON", e);
            return null;
        }
    }

    private String extraerIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }
}
