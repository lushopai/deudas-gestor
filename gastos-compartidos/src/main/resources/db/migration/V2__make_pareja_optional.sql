-- Migración: Hacer pareja_id opcional en la tabla gastos
-- Esto permite que los usuarios creen gastos individuales sin necesidad de tener una pareja

ALTER TABLE gastos MODIFY COLUMN pareja_id BIGINT NULL;
