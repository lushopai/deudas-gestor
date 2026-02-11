#!/bin/bash

#############################################
# Script de Restauración PostgreSQL
# Proyecto: Gastos Compartidos
#############################################

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
DB_HOST="${DB_HOST:-192.168.1.18}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-mi_basedatos}"
DB_USER="${DB_USER:-admin}"
DB_PASSWORD="${DB_PASSWORD:-admin123}"

echo "================================================"
echo "  Restauración de Base de Datos"
echo "================================================"
echo ""

# Verificar si se proporcionó un archivo
if [ -z "$1" ]; then
    echo -e "${YELLOW}Uso: $0 <archivo_backup.sql.gz>${NC}"
    echo ""
    echo -e "${YELLOW}Backups disponibles:${NC}"
    if [ -d "$BACKUP_DIR" ]; then
        ls -lht "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -10
        echo ""
        echo -e "${YELLOW}Ejemplo:${NC}"
        LATEST=$(ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -1)
        if [ -n "$LATEST" ]; then
            echo "  $0 $LATEST"
        fi
    else
        echo -e "${RED}  No se encontró el directorio de backups: $BACKUP_DIR${NC}"
    fi
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: El archivo no existe: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Información del backup:${NC}"
echo "  Archivo: $(basename $BACKUP_FILE)"
echo "  Tamaño: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "  Fecha: $(stat -c %y "$BACKUP_FILE" 2>/dev/null || stat -f "%Sm" "$BACKUP_FILE" 2>/dev/null)"
echo ""
echo -e "${YELLOW}🎯 Destino de la restauración:${NC}"
echo "  Base de datos: $DB_NAME"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  Usuario: $DB_USER"
echo ""

# Advertencia
echo -e "${RED}⚠️  ADVERTENCIA ⚠️${NC}"
echo -e "${RED}Esto sobrescribirá TODOS los datos actuales en la base de datos.${NC}"
echo -e "${RED}Esta acción NO se puede deshacer.${NC}"
echo ""

# Confirmación
read -p "¿Estás seguro de que deseas continuar? (escribe 'yes' para confirmar): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Operación cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🔄 Iniciando restauración...${NC}"

# Realizar restauración
export PGPASSWORD="$DB_PASSWORD"

# Primero, eliminar todas las conexiones activas
echo -e "${YELLOW}1. Cerrando conexiones activas...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null

# Eliminar y recrear la base de datos
echo -e "${YELLOW}2. Recreando base de datos...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al recrear la base de datos${NC}"
    unset PGPASSWORD
    exit 1
fi

# Restaurar el backup
echo -e "${YELLOW}3. Restaurando datos...${NC}"
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}  ✅ Base de datos restaurada exitosamente${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${YELLOW}📊 Verificando tablas restauradas:${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt"
else
    echo -e "${RED}❌ Error al restaurar la base de datos${NC}"
    unset PGPASSWORD
    exit 1
fi

unset PGPASSWORD
exit 0
