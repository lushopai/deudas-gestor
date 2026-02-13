-- V1__init_schema.sql
-- Esquema inicial completo (recreación de entidades existentes)

-- 1. Parejas
CREATE TABLE IF NOT EXISTS parejas (
    id BIGSERIAL PRIMARY KEY,
    codigo_invitacion VARCHAR(255) NOT NULL UNIQUE,
    nombre_pareja VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255),
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    foto_perfil VARCHAR(255),
    telefono VARCHAR(255),
    bio VARCHAR(500),
    provider VARCHAR(255) NOT NULL DEFAULT 'LOCAL',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    pareja_id BIGINT,
    CONSTRAINT fk_usuarios_pareja FOREIGN KEY (pareja_id) REFERENCES parejas(id)
);

-- 3. Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    icono VARCHAR(255),
    color VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- 4. Gastos
CREATE TABLE IF NOT EXISTS gastos (
    id BIGSERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    monto_original NUMERIC(10, 2) NOT NULL,
    notas VARCHAR(255),
    ruta_foto VARCHAR(255),
    usuario_id BIGINT NOT NULL,
    pareja_id BIGINT, -- Puede ser null
    categoria_id BIGINT,
    deleted_at TIMESTAMP, -- Soft delete
    fecha_gasto TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_gastos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_gastos_pareja FOREIGN KEY (pareja_id) REFERENCES parejas(id),
    CONSTRAINT fk_gastos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- 5. Gasto Splits
CREATE TABLE IF NOT EXISTS gasto_splits (
    id BIGSERIAL PRIMARY KEY,
    gasto_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'DEBE',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_splits_gasto FOREIGN KEY (gasto_id) REFERENCES gastos(id) ON DELETE CASCADE,
    CONSTRAINT fk_splits_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 6. Gastos Recurrentes
CREATE TABLE IF NOT EXISTS gastos_recurrentes (
    id BIGSERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    usuario_id BIGINT NOT NULL,
    pareja_id BIGINT,
    categoria_id BIGINT,
    frecuencia VARCHAR(50) NOT NULL,
    dia_ejecucion INTEGER NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    ultima_ejecucion DATE,
    proxima_ejecucion DATE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    es_compartido BOOLEAN NOT NULL DEFAULT FALSE,
    notas VARCHAR(500),
    total_ejecutado INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_recurrentes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_recurrentes_pareja FOREIGN KEY (pareja_id) REFERENCES parejas(id),
    CONSTRAINT fk_recurrentes_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- 7. Presupuestos
CREATE TABLE IF NOT EXISTS presupuestos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    categoria_id BIGINT, -- Null = global
    limite NUMERIC(10, 2) NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    notas VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_presupuestos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_presupuestos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT uk_presupuesto_usuario_cat_periodo UNIQUE (usuario_id, categoria_id, periodo)
);

-- 8. Deudas
CREATE TABLE IF NOT EXISTS deudas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    acreedor VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    tipo VARCHAR(50) NOT NULL,
    monto_original NUMERIC(12, 2) NOT NULL,
    saldo_pendiente NUMERIC(12, 2) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVA',
    fecha_inicio DATE,
    fecha_vencimiento DATE,
    dia_corte INTEGER,
    dia_limite_pago INTEGER,
    tasa_interes NUMERIC(5, 2),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_deudas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 9. Abonos Deuda
CREATE TABLE IF NOT EXISTS abonos_deuda (
    id BIGSERIAL PRIMARY KEY,
    deuda_id BIGINT NOT NULL,
    monto NUMERIC(12, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL DEFAULT 'TRANSFERENCIA',
    comprobante VARCHAR(100),
    notas VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_abonos_deuda FOREIGN KEY (deuda_id) REFERENCES deudas(id)
);

-- 10. Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id BIGSERIAL PRIMARY KEY,
    pagador_id BIGINT NOT NULL,
    receptor_id BIGINT NOT NULL,
    pareja_id BIGINT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    concepto VARCHAR(500),
    metodo_pago VARCHAR(50) NOT NULL DEFAULT 'EFECTIVO',
    estado VARCHAR(50) NOT NULL DEFAULT 'COMPLETADO',
    fecha_pago TIMESTAMP NOT NULL DEFAULT NOW(),
    mes_pago INTEGER,
    ano_pago INTEGER,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_pagos_pagador FOREIGN KEY (pagador_id) REFERENCES usuarios(id),
    CONSTRAINT fk_pagos_receptor FOREIGN KEY (receptor_id) REFERENCES usuarios(id),
    CONSTRAINT fk_pagos_pareja FOREIGN KEY (pareja_id) REFERENCES parejas(id)
);

-- 11. Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    endpoint VARCHAR(1000) NOT NULL,
    p256dh_key VARCHAR(500) NOT NULL,
    auth_key VARCHAR(500) NOT NULL,
    ultima_notificacion TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_push_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT uk_push_endpoint UNIQUE (endpoint)
);
