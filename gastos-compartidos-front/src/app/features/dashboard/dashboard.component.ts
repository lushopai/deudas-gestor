import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';
import { GastoService, Gasto, ResumenGastos } from '../../core/services/gasto.service';
import { DeudaService, ResumenDeudas } from '../../core/services/deuda.service';
import { GastoRecurrenteService, GastoRecurrente } from '../../core/services/gasto-recurrente.service';
import { ReminderService } from '../../core/services/reminder.service';
import { BalanceCard } from '../deudas/balance-card/balance-card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader';
import { PullToRefreshDirective } from '../../shared/directives/pull-to-refresh.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    BalanceCard,
    EmptyStateComponent,
    SkeletonLoaderComponent,
    PullToRefreshDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  gastosRecientes: Gasto[] = [];
  resumenGastos: ResumenGastos | null = null;
  resumenDeudas: ResumenDeudas | null = null;
  proximosRecurrentes: GastoRecurrente[] = [];
  cargando = true;
  error: string | null = null;
  Object = Object;  // Hacer Object accesible en el template

  constructor(
    public authService: AuthService,
    private gastoService: GastoService,
    private deudaService: DeudaService,
    private gastoRecurrenteService: GastoRecurrenteService,
    private reminderService: ReminderService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarDatos();
    // Verificar recordatorios con un pequeño delay para no bloquear la carga
    setTimeout(() => this.reminderService.verificarRecordatorios(), 2000);
  }

  cargarDatos() {
    this.cargando = true;
    this.error = null;

    forkJoin({
      recent: this.gastoService.obtenerGastosRecientes(5),
      summary: this.gastoService.obtenerResumenGastos()
    }).subscribe({
      next: ({ recent, summary }) => {
        this.gastosRecientes = recent;
        this.resumenGastos = summary;
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.error = 'No se pudieron cargar los datos. Por favor, intenta de nuevo.';
        this.cargando = false;
        this.cdRef.detectChanges();
      }
    });

    // Cargar resumen de deudas externas (separado para no bloquear si falla)
    this.deudaService.obtenerResumen().subscribe({
      next: (resumen) => {
        this.resumenDeudas = resumen;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.resumenDeudas = null;
      }
    });

    // Cargar próximos gastos recurrentes (próximos 7 días)
    this.gastoRecurrenteService.proximos(7).subscribe({
      next: (proximos) => {
        this.proximosRecurrentes = proximos;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.proximosRecurrentes = [];
      }
    });
  }

  obtenerPorcentaje(monto: number, total: number): number {
    return total > 0 ? Math.round((monto / total) * 100) : 0;
  }

  abrirNuevoGasto() {
    this.router.navigate(['/gastos/nuevo']);
  }

  abrirOCR() {
    this.router.navigate(['/gastos/ocr']);
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  reintentar() {
    this.cargarDatos();
  }

  abrirDeudas() {
    this.router.navigate(['/deudas-externas']);
  }

  abrirRecurrentes() {
    this.router.navigate(['/gastos-recurrentes']);
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  }
}
