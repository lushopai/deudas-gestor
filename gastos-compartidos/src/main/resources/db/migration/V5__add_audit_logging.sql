-- Tabla para auditoría: registra acciones de creación, actualización y eliminación
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    accion VARCHAR(20) NOT NULL,
    tabla_nombre VARCHAR(50) NOT NULL,
    registro_id BIGINT,
    datos_antes TEXT,
    datos_despues TEXT,
    descripcion VARCHAR(255),
    ip_origen VARCHAR(45),
    fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_audit_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_tabla ON audit_log(tabla_nombre);
CREATE INDEX IF NOT EXISTS idx_audit_fecha ON audit_log(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_audit_usuario_fecha ON audit_log(usuario_id, fecha_hora);
