import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegistroComponent } from './features/auth/registro.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Eager: Dashboard (página principal)
      { path: 'dashboard', component: DashboardComponent },

      // Lazy: Perfil
      { path: 'perfil', loadComponent: () => import('./features/usuario/perfil.component').then(m => m.PerfilComponent) },

      // Lazy: Gastos
      { path: 'gastos', loadComponent: () => import('./features/gasto/gastos-list.component').then(m => m.GastosListComponent) },
      { path: 'gastos/nuevo', loadComponent: () => import('./features/gasto/gasto-form.component').then(m => m.GastoFormComponent) },
      { path: 'gastos/editar/:id', loadComponent: () => import('./features/gasto/gasto-form.component').then(m => m.GastoFormComponent) },
      { path: 'gastos/ocr', loadComponent: () => import('./features/gasto/gasto-form.component').then(m => m.GastoFormComponent) },

      // Lazy: Reportes
      { path: 'reportes', loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent) },

      // Lazy: Deudas (pareja) - Hub con child routes
      {
        path: 'deudas',
        loadComponent: () => import('./features/deudas/deudas-hub.component').then(m => m.DeudasHubComponent),
        children: [
          { path: 'abonar', loadComponent: () => import('./features/deudas/pago-form/pago-form').then(m => m.PagoForm) },
          { path: 'historial', loadComponent: () => import('./features/deudas/historial-pagos/historial-pagos').then(m => m.HistorialPagos) }
        ]
      },

      // Lazy: Pareja
      { path: 'pareja/configurar', loadComponent: () => import('./features/pareja/pareja-setup/pareja-setup').then(m => m.ParejaSetup) },

      // Lazy: Deudas Externas
      { path: 'deudas-externas', loadComponent: () => import('./features/deudas-externas/deudas-list/deudas-list').then(m => m.DeudasList) },
      { path: 'deudas-externas/nueva', loadComponent: () => import('./features/deudas-externas/deuda-form/deuda-form').then(m => m.DeudaForm) },
      { path: 'deudas-externas/:id', loadComponent: () => import('./features/deudas-externas/deuda-detail/deuda-detail').then(m => m.DeudaDetail) },
      { path: 'deudas-externas/:id/editar', loadComponent: () => import('./features/deudas-externas/deuda-form/deuda-form').then(m => m.DeudaForm) },
      { path: 'deudas-externas/:id/abonar', loadComponent: () => import('./features/deudas-externas/abono-form/abono-form').then(m => m.AbonoForm) },

      // Lazy: Gastos Recurrentes
      { path: 'gastos-recurrentes', loadComponent: () => import('./features/gastos-recurrentes/recurrentes-list/recurrentes-list').then(m => m.RecurrentesList) },
      { path: 'gastos-recurrentes/nuevo', loadComponent: () => import('./features/gastos-recurrentes/recurrente-form/recurrente-form').then(m => m.RecurrenteForm) },
      { path: 'gastos-recurrentes/:id/editar', loadComponent: () => import('./features/gastos-recurrentes/recurrente-form/recurrente-form').then(m => m.RecurrenteForm) },

      // Lazy: Presupuestos
      { path: 'presupuestos', loadComponent: () => import('./features/presupuestos/presupuesto-list.component').then(m => m.PresupuestoListComponent) },

      // Lazy: Settings
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
