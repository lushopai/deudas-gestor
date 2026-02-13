-- =====================================================
-- V2: Soft Delete para tabla gastos
-- Ejecutar manualmente en producción antes del deploy
-- =====================================================

-- Agregar columna deleted_at para soft deletes
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Índice para excluir registros eliminados eficientemente
CREATE INDEX IF NOT EXISTS idx_gastos_deleted_at ON gastos(deleted_at);

-- Índice parcial: solo gastos NO eliminados (mejor performance en queries normales)
-- Nota: Esto es PostgreSQL. Si usas MySQL, omitir el WHERE.
CREATE INDEX IF NOT EXISTS idx_gastos_activos_usuario_fecha 
    ON gastos(usuario_id, fecha_gasto DESC) 
    WHERE deleted_at IS NULL;
