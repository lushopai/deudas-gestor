-- Tabla para auditoría: registra todas las acciones de creación, actualización y eliminación
CREATE TABLE audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    accion VARCHAR(20) NOT NULL,       -- CREATE, UPDATE, DELETE
    tabla_nombre VARCHAR(50) NOT NULL, -- nombre de la tabla afectada
    registro_id BIGINT,                -- ID del registro modificado
    datos_antes LONGTEXT,              -- JSON del estado anterior (para UPDATE/DELETE)
    datos_despues LONGTEXT,            -- JSON del estado nuevo (para CREATE/UPDATE)
    descripcion VARCHAR(255),          -- Descripción legible de la acción
    ip_origen VARCHAR(45),             -- IP del cliente que originó la acción
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_tabla (tabla_nombre),
    INDEX idx_fecha (fecha_hora),
    INDEX idx_usuario_fecha (usuario_id, fecha_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
