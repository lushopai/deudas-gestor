# Guía de Diseño - Sistema Minimalista

## 🎨 Paleta de Colores

### Colores Principales
- **Primary**: `#1976d2` (Azul Material)
- **Primary Dark**: `#1565c0`
- **Primary Light**: `#42a5f5`

### Colores de Texto
- **Primario**: `rgba(0, 0, 0, 0.87)` - Texto principal
- **Secundario**: `rgba(0, 0, 0, 0.6)` - Texto de apoyo
- **Deshabilitado**: `rgba(0, 0, 0, 0.38)` - Texto inactivo

### Colores de Fondo
- **Primario**: `#ffffff` - Blanco puro
- **Secundario**: `#fafafa` - Gris muy claro
- **Terciario**: `#f5f5f5` - Gris claro

### Estados
- **Éxito**: `#4caf50` (Verde)
- **Error**: `#f44336` (Rojo)
- **Advertencia**: `#ff9800` (Naranja)
- **Información**: `#2196f3` (Azul claro)

## 📏 Espaciado

Usar múltiplos de 4px/8px:
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

## 🔤 Tipografía

### Fuente
- **Principal**: Roboto, Helvetica Neue, sans-serif

### Tamaños
- **Small**: 12px
- **Base**: 14px
- **Large**: 16px
- **XL**: 20px
- **2XL**: 24px

### Pesos
- **Regular**: 400
- **Medium**: 500
- **Bold**: 700 (usar con moderación)

## 🎯 Componentes

### Botones
- **Primario**: Fondo azul (#1976d2), texto blanco
- **Secundario**: Outline azul, texto azul
- **Altura**: 40px (móvil), 48px (desktop)
- **Border radius**: 4px

### Cards
- **Fondo**: Blanco (#ffffff)
- **Sombra**: `0 2px 4px rgba(0, 0, 0, 0.1)`
- **Border radius**: 4px
- **Padding**: 16px-24px

### Form Fields
- **Appearance**: Fill (Material Design)
- **Background**: #f5f5f5
- **Altura**: 56px
- **Spacing**: 20px entre campos

### Toolbar
- **Fondo**: #1976d2
- **Altura**: 56px (móvil), 64px (desktop)
- **Sombra**: `0 2px 4px rgba(0, 0, 0, 0.1)`

## 📱 Responsive

### Breakpoints
- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

### Consideraciones PWA
- Usar `env(safe-area-inset-*)` para áreas seguras
- Touch targets mínimo 48x48px
- Espaciado generoso en móvil

## 🔔 Alertas (SweetAlert2)

### Tipos
1. **Success**: Verde, icono de check
2. **Error**: Rojo, icono de X, incluir detalles en footer
3. **Warning**: Naranja, icono de advertencia
4. **Info**: Azul, icono de información
5. **Confirm**: Pregunta, dos botones

### Configuración
- **Confirm button**: #1976d2
- **Cancel button**: #757575
- **Border radius**: 8px
- **Font**: Roboto

## ✅ Checklist de Componentes

Al crear/modificar un componente, verificar:

- [ ] Usa variables CSS globales
- [ ] Responsive (mobile-first)
- [ ] Usa AlertService en lugar de MatSnackBar
- [ ] Sombras sutiles (no más de 0.12 opacity)
- [ ] Espaciado consistente (múltiplos de 4/8px)
- [ ] Colores de la paleta oficial
- [ ] Tipografía Roboto
- [ ] Touch targets >= 48px
- [ ] Safe areas para PWA
- [ ] Estados de carga claros
- [ ] Estados vacíos informativos

## 🚫 Evitar

- ❌ Gradientes (excepto en casos muy específicos)
- ❌ Colores saturados o neón
- ❌ Sombras muy marcadas
- ❌ Border radius > 8px
- ❌ Múltiples colores primarios
- ❌ Animaciones excesivas
- ❌ Fuentes que no sean Roboto
- ❌ Iconos de diferentes familias

## 📦 Estructura de Archivos

```
component/
├── component.ts          # Lógica
├── component.html        # Template
├── component.scss        # Estilos (usar variables globales)
└── component.spec.ts     # Tests
```

## 🎨 Ejemplo de Componente Ideal

```typescript
// Imports limpios
import { AlertService } from '../../core/services/alert.service';

// Constructor simple
constructor(
  private alertService: AlertService
) {}

// Manejo de errores consistente
this.alertService.error(
  'Mensaje principal',
  'Título',
  'Detalles técnicos opcionales'
);
```

```scss
// Estilos usando variables
.container {
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.title {
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  font-weight: 400;
}
```

## 🔄 Migración de Componentes Existentes

1. Reemplazar `MatSnackBar` con `AlertService`
2. Actualizar colores a la paleta oficial
3. Usar variables CSS en lugar de valores hardcoded
4. Verificar responsive
5. Probar en móvil
6. Verificar safe areas (PWA)
