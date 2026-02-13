import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { PresupuestoService, Presupuesto } from '../../core/services/presupuesto.service';
import { BalanceCard } from '../deudas/balance-card/balance-card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader';
import { PullToRefreshDirective } from '../../shared/directives/pull-to-refresh.directive';
import { TranslateModule } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
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
    PullToRefreshDirective,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  gastosRecientes: Gasto[] = [];
  resumenGastos: ResumenGastos | null = null;
  resumenDeudas: ResumenDeudas | null = null;
  proximosRecurrentes: GastoRecurrente[] = [];
  ejecutadosHoy: GastoRecurrente[] = [];
  presupuestos: Presupuesto[] = [];
  cargando = true;
  error: string | null = null;
  Object = Object;  // Hacer Object accesible en el template

  // Chart configuration
  public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          font: { size: 11 },
          boxWidth: 12
        }
      },
    },
    cutout: '60%' // Doughnut style
  };

  public pieChartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };
  
  public pieChartType = 'doughnut' as const;

  constructor(
    public authService: AuthService,
    private gastoService: GastoService,
    private deudaService: DeudaService,
    private gastoRecurrenteService: GastoRecurrenteService,
    private reminderService: ReminderService,
    private presupuestoService: PresupuestoService,
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
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ recent, summary }) => {
        this.gastosRecientes = recent;
        this.resumenGastos = summary;

        // Update Chart Data
        if (summary && summary.gastosPorCategoria) {
          const labels = Object.keys(summary.gastosPorCategoria);
          const data = Object.values(summary.gastosPorCategoria);
          const backgroundColors = this.generarColores(labels.length);

          this.pieChartData = {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: backgroundColors,
              borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e1e1e' : '#ffffff',
              borderWidth: 2
            }]
          };
        }

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
    this.deudaService.obtenerResumen().pipe(takeUntil(this.destroy$)).subscribe({
      next: (resumen) => {
        this.resumenDeudas = resumen;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.resumenDeudas = null;
      }
    });

    // Cargar próximos gastos recurrentes (próximos 7 días)
    this.gastoRecurrenteService.proximos(7).pipe(takeUntil(this.destroy$)).subscribe({
      next: (proximos) => {
        this.proximosRecurrentes = proximos;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.proximosRecurrentes = [];
      }
    });

    // Detectar gastos recurrentes ejecutados hoy
    this.gastoRecurrenteService.listar(true).pipe(takeUntil(this.destroy$)).subscribe({
      next: (activos) => {
        const hoy = new Date().toISOString().split('T')[0];
        this.ejecutadosHoy = activos.filter(gr => gr.ultimaEjecucion === hoy);
        this.cdRef.detectChanges();
      },
      error: () => {
        this.ejecutadosHoy = [];
      }
    });

    // Cargar presupuestos activos
    this.presupuestoService.listarActivos().pipe(takeUntil(this.destroy$)).subscribe({
      next: (presupuestos) => {
        this.presupuestos = presupuestos;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.presupuestos = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  get totalEjecutadoHoy(): number {
    return this.ejecutadosHoy.reduce((sum, gr) => sum + gr.monto, 0);
  }

  descartarBannerEjecutados() {
    this.ejecutadosHoy = [];
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  }

  generarColores(cantidad: number): string[] {
    const baseColors = [
      '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0',
      '#00bcd4', '#ffeb3b', '#795548', '#607d8b', '#e91e63'
    ];

    const colores = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(baseColors[i % baseColors.length]);
    }
    return colores;
  }
}
