package com.gastos.gastos_compartidos.entity;

public enum AuditAction {
    CREATE,  // Creación de nuevo registro
    UPDATE,  // Actualización de registro
    DELETE;  // Eliminación de registro (soft del o hard delete)
}
