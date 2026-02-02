# Gastos Compartidos - Frontend PWA

**Frontend responsivo con Angular 19, Material Design y Tesseract.js OCR**

## 📋 Estructura de Carpetas

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── api.service.ts              ✓ Servicio de API
│   │   │   ├── auth.service.ts             ✓ Autenticación y tokens
│   │   │   └── ocr.service.ts              ✓ Procesamiento OCR con Tesseract.js
│   │   └── interceptors/
│   │       └── jwt.interceptor.ts          ✓ Interceptor JWT para headers
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login.component.ts          ✓ Login responsivo
│   │   │   └── registro.component.ts       ✓ Registro de nuevos usuarios
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts      ✓ Dashboard principal
│   │   └── gasto/
│   │       └── gasto-form.component.ts     ✓ Formulario con OCR integrado
│   ├── shared/
│   │   └── components/                     (Componentes reutilizables)
│   ├── app.routes.ts                       (Rutas - requiere actualización)
│   ├── app.config.ts                       (Config - requiere actualización)
│   └── app.ts                              (Componente raíz)
├── index.html
├── main.ts
└── styles.scss
```

## ✓ Qué está Implementado

- **Servicios de API:**
  - ✓ Login, Registro, Refresh Token
  - ✓ CRUD de Gastos
  - ✓ Categorías
  - ✓ Reportes

- **Autenticación:**
  - ✓ Login/Registro con email y contraseña
  - ✓ JWT Token management
  - ✓ Interceptor automático de headers
  - ○ Google OAuth2 (pendiente configuración)

- **Componentes:**
  - ✓ Login responsivo con formulario validado
  - ✓ Registro de nuevos usuarios
  - ✓ Dashboard con bienvenida
  - ✓ Formulario de gastos con 2 tabs:
    - Ingreso manual
    - Escaneo OCR con Tesseract.js

- **OCR:**
  - ✓ Procesamiento de imágenes con Tesseract.js
  - ✓ Extracción de montos, fechas y descripciones
  - ✓ Auto-llenado de formulario

## ⚠️ Próximos Pasos (TODO)

### 1. Actualizar app.routes.ts
Reemplazar contenido con:
```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegistroComponent } from './features/auth/registro.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { GastoFormComponent } from './features/gasto/gasto-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'gastos/nuevo', component: GastoFormComponent },
  { path: 'gastos/ocr', component: GastoFormComponent },
  { path: '**', redirectTo: '/dashboard' }
];
```

### 2. Actualizar app.config.ts
Configurar providers con HttpClient e interceptores.

### 3. Actualizar app.ts
Importar componentes standalone y router.

### 4. Agregar RouterLink en componentes
En los componentes que usan `routerLink`, agregar:
```typescript
import { RouterLink, RouterOutlet } from '@angular/router';
```

### 5. Configurar PWA
```bash
ng add @angular/pwa
```

### 6. Configurar Google OAuth2
```bash
npm install @react-oauth/google
```

### 7. Ejecutar en dev
```bash
ng serve --port 4200 --host 0.0.0.0
```

## 🔧 Instalación de Dependencias

Ya instaladas:
- ✓ @angular/material
- ✓ @angular/cdk
- ✓ @angular/pwa
- ✓ tesseract.js

Falta instalar:
- @react-oauth/google (para OAuth2 Google)

## 📱 Testing en Móvil

Desde Android/iOS, acceder a:
```
http://[IP_WINDOWS]:4200
```

Ejemplo:
```
http://192.168.1.XX:4200
```

## 🎨 Features Responsivos

- ✓ Mobile-first design
- ✓ Material Design Components
- ✓ Flexbox y Grid layout
- ✓ Media queries para tablets
- ✓ PWA ready

## 🚀 Próxima Sesión

1. Completar archivos de configuración
2. Instalar y configurar Google OAuth2
3. Agregar componentes faltantes (Reportes, etc.)
4. Testing en dispositivos móviles
5. Build para producción

---

**Backend API:** http://localhost:8080
**Frontend Dev:** http://localhost:4200
**Documentación API:** http://localhost:8080/swagger-ui.html
