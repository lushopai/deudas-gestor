-- Script de inicialización de PostgreSQL para Gastos Compartidos

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tablas
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255),
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    foto_perfil VARCHAR(500),
    provider VARCHAR(50) DEFAULT 'LOCAL',
    pareja_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parejas (
    id SERIAL PRIMARY KEY,
    codigo_invitacion VARCHAR(8) UNIQUE NOT NULL,
    nombre_pareja VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    icono VARCHAR(50),
    color VARCHAR(50),
    activo BOOLEAN DEFAULT true
);

CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    monto_original DECIMAL(10, 2),
    ruta_foto VARCHAR(500),
    fecha_gasto TIMESTAMP NOT NULL,
    usuario_id INT NOT NULL,
    pareja_id INT NOT NULL,
    categoria_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (pareja_id) REFERENCES parejas(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE gasto_splits (
    id SERIAL PRIMARY KEY,
    monto DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    usuario_id INT NOT NULL,
    gasto_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (gasto_id) REFERENCES gastos(id)
);

-- Crear índices para mejorar performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_google_id ON usuarios(google_id);
CREATE INDEX idx_usuarios_pareja_id ON usuarios(pareja_id);
CREATE INDEX idx_parejas_codigo ON parejas(codigo_invitacion);
CREATE INDEX idx_gastos_pareja_id ON gastos(pareja_id);
CREATE INDEX idx_gastos_usuario_id ON gastos(usuario_id);
CREATE INDEX idx_gastos_categoria_id ON gastos(categoria_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha_gasto);
CREATE INDEX idx_gasto_splits_usuario_id ON gasto_splits(usuario_id);
CREATE INDEX idx_gasto_splits_gasto_id ON gasto_splits(gasto_id);

-- Insertar categorías predefinidas
INSERT INTO categorias (nombre, icono, color, activo) VALUES
    ('Supermercado', '🛒', '#FF6B6B', true),
    ('Transporte', '🚗', '#4ECDC4', true),
    ('Restaurante', '🍽️', '#FFE66D', true),
    ('Cine', '🎬', '#95E1D3', true),
    ('Casa', '🏠', '#C7CEEA', true),
    ('Farmacia', '💊', '#BB6BD9', true),
    ('Otros', '📌', '#D4D4D4', true);

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente' as mensaje;
