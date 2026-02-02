import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegistroComponent } from './features/auth/registro.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PerfilComponent } from './features/usuario/perfil.component';
import { GastoFormComponent } from './features/gasto/gasto-form.component';
import { GastosListComponent } from './features/gasto/gastos-list.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'gastos', component: GastosListComponent },
      { path: 'gastos/nuevo', component: GastoFormComponent },
      { path: 'gastos/editar/:id', component: GastoFormComponent },
      { path: 'gastos/ocr', component: GastoFormComponent },
      { path: 'reportes', component: ReportesComponent }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
