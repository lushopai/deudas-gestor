-- =============================================================================
-- V3: Índices de rendimiento para consultas paginadas
-- Sprint 8 - Paginación Backend + Índices BD
-- =============================================================================

-- Índices para la tabla 'gastos'
-- Usado por: findByParejaidOrderByFechaGastoDesc (paginado)
CREATE INDEX IF NOT EXISTS idx_gastos_pareja_fecha
    ON gastos (pareja_id, fecha_gasto DESC);

-- Usado por: findByUsuarioRegistradorIdOrderByFechaGastoDesc (paginado)
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_fecha
    ON gastos (usuario_registrador_id, fecha_gasto DESC);

-- Usado por: findByParejaidAndFechaRango (exportación PDF/Excel)
CREATE INDEX IF NOT EXISTS idx_gastos_pareja_rango
    ON gastos (pareja_id, fecha_gasto);

-- Usado por: findByCategoria
CREATE INDEX IF NOT EXISTS idx_gastos_categoria
    ON gastos (categoria_id);

-- Índices para la tabla 'deudas'
-- Usado por: findByUsuarioIdOrderByFechaCreacionDesc (paginado)
CREATE INDEX IF NOT EXISTS idx_deudas_usuario_fecha
    ON deudas (usuario_id, fecha_creacion DESC);

-- Usado por: filtro soloActivas
CREATE INDEX IF NOT EXISTS idx_deudas_usuario_estado
    ON deudas (usuario_id, estado);

-- Índices para la tabla 'abonos_deuda'
-- Usado por: findByDeudaIdOrderByFechaPagoDesc
CREATE INDEX IF NOT EXISTS idx_abonos_deuda_fecha
    ON abonos_deuda (deuda_id, fecha_pago DESC);

-- Índices para la tabla 'pagos'
-- Usado por: findByParejaIdOrderByFechaPagoDesc (paginado)
CREATE INDEX IF NOT EXISTS idx_pagos_pareja_fecha
    ON pagos (pareja_id, fecha_pago DESC);

-- Usado por: consultas por mes/año
CREATE INDEX IF NOT EXISTS idx_pagos_pareja_mes
    ON pagos (pareja_id, ano_pago, mes_pago);

-- Índices para la tabla 'gastos_recurrentes'
-- Usado por: scheduler de ejecución diaria
CREATE INDEX IF NOT EXISTS idx_gastos_recurrentes_activo
    ON gastos_recurrentes (activo, proxima_ejecucion);
