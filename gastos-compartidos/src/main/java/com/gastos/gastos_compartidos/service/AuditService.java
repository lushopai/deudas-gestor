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

/**
 * Servicio para registrar acciones de auditoría
 * Captura CREATE, UPDATE, y DELETE en las tablas principales
 */
@Service
@Slf4j
public class AuditService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Registra una acción de auditoría
     * 
     * @param usuarioId       ID del usuario que realizó la acción
     * @param accion          Tipo de acción (CREATE, UPDATE, DELETE)
     * @param tablaNombre     Nombre de la tabla afectada
     * @param registroId      ID del registro modificado
     * @param datosAntes      Estado anterior del registro (null para CREATE)
     * @param datosDespues    Estado nuevo del registro
     * @param descripcion     Descripción legible (ej: "Gasto agregado", "Presupuesto actualizado")
     * @param request         HttpServletRequest para extraer IP
     */
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
            log.debug("Auditoría registrada: {} - {} en tabla {}", usuarioId, accion, tablaNombre);
            
        } catch (Exception e) {
            log.error("Error al registrar auditoría", e);
            // No lanzamos excepción para que no interrumpa el flujo principal
        }
    }
    
    /**
     * Registra una acción de auditoría (sin descripción explícita)
     */
    @Transactional
    public void registrar(Long usuarioId, AuditAction accion, String tablaNombre,
                         Long registroId, Object datosAntes, Object datosDespues,
                         HttpServletRequest request) {
        registrar(usuarioId, accion, tablaNombre, registroId, datosAntes, datosDespues, null, request);
    }
    
    /**
     * Obtiene el historial de auditoría de un usuario
     */
    public List<AuditLog> obtenerHistorialUsuario(Long usuarioId) {
        return auditLogRepository.findByUsuarioIdOrderByFechaHoraDesc(usuarioId);
    }
    
    /**
     * Obtiene el historial de cambios de una tabla
     */
    public List<AuditLog> obtenerHistorialTabla(String tablaNombre) {
        return auditLogRepository.findByTablaNombreOrderByFechaHoraDesc(tablaNombre);
    }
    
    /**
     * Obtiene los cambios realizados a un registro específico
     */
    public List<AuditLog> obtenerHistorialRegistro(String tablaNombre, Long registroId) {
        return auditLogRepository.findAll().stream()
            .filter(a -> a.getTablaNombre().equals(tablaNombre) && 
                        a.getRegistroId() != null && 
                        a.getRegistroId().equals(registroId))
            .sorted((a, b) -> b.getFechaHora().compareTo(a.getFechaHora()))
            .toList();
    }
    
    /**
     * Obtiene acciones en un rango de fechas
     */
    public List<AuditLog> obtenerPorFecha(LocalDateTime inicio, LocalDateTime fin) {
        return auditLogRepository.findByDateRange(inicio, fin);
    }
    
    /**
     * Convierte un objeto a JSON
     * @param obj Objeto a convertir
     * @return String con JSON, o null si el objeto es null o hay error
     */
    private String convertirAJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("No se pudo serializar objeto a JSON", e);
            return null;
        }
    }
    
    /**
     * Extrae la IP del cliente del HttpServletRequest
     */
    private String extraerIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        
        // Buscar IP en header X-Forwarded-For (proxy/ngrok)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0]; // Primera IP si hay múltiples
        }
        
        // IP directa del cliente
        return request.getRemoteAddr();
    }
}
