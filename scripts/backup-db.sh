#!/bin/bash

#############################################
# Script de Backup Automatizado PostgreSQL
# Proyecto: Gastos Compartidos
#############################################

# Configuración
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="${DB_HOST:-192.168.1.18}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-mi_basedatos}"
DB_USER="${DB_USER:-admin}"
DB_PASSWORD="${DB_PASSWORD:-admin123}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================"
echo "  Backup de Base de Datos - Gastos Compartidos"
echo "================================================"
echo ""

# Crear directorio si no existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}📁 Creando directorio de backups: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al crear directorio de backups${NC}"
        exit 1
    fi
fi

# Nombre del archivo de backup
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_$DATE.sql.gz"

echo -e "${YELLOW}🔄 Iniciando backup...${NC}"
echo "  Base de datos: $DB_NAME"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  Usuario: $DB_USER"
echo "  Archivo: $BACKUP_FILE"
echo ""

# Realizar backup
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$BACKUP_FILE"

# Verificar que el backup se creó correctamente
if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup completado exitosamente${NC}"
    echo "  Archivo: $(basename $BACKUP_FILE)"
    echo "  Tamaño: $BACKUP_SIZE"
    echo ""
    
    # Mantener solo los últimos N días
    echo -e "${YELLOW}🗑️  Limpiando backups antiguos (>$RETENTION_DAYS días)...${NC}"
    DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -type f -delete -print | wc -l)
    echo "  Backups eliminados: $DELETED_COUNT"
    echo ""
    
    # Mostrar espacio usado
    echo -e "${YELLOW}💾 Espacio usado por backups:${NC}"
    du -sh "$BACKUP_DIR"
    echo ""
    
    # Listar últimos 5 backups
    echo -e "${YELLOW}📋 Últimos 5 backups:${NC}"
    ls -lht "$BACKUP_DIR"/backup_*.sql.gz | head -5
    echo ""
    
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}  ✅ Proceso completado exitosamente${NC}"
    echo -e "${GREEN}================================================${NC}"
    
else
    echo -e "${RED}❌ Error al crear backup${NC}"
    echo -e "${RED}   Verifica la conexión a la base de datos${NC}"
    unset PGPASSWORD
    exit 1
fi

unset PGPASSWORD
exit 0
