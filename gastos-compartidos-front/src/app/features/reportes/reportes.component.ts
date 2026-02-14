import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';
import { ReporteMonthSelectorComponent } from './components/reporte-month-selector';
import { ReporteSummaryCardComponent } from './components/reporte-summary-card';
import { ReporteBalanceBarComponent } from './components/reporte-balance-bar';
import { ReportePieChartComponent } from './components/reporte-pie-chart';
import { ReporteBarChartComponent } from './components/reporte-bar-chart';
import { ReporteCategoriaDetailComponent } from './components/reporte-categoria-detail';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    ReporteMonthSelectorComponent,
    ReporteSummaryCardComponent,
    ReporteBalanceBarComponent,
    ReportePieChartComponent,
    ReporteBarChartComponent,
    ReporteCategoriaDetailComponent
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="volver()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>Reportes</span>
      @if (reporte && reporte.cantidadGastos > 0) {
        <button mat-icon-button [matMenuTriggerFor]="exportMenu" aria-label="Exportar">
          <mat-icon>file_download</mat-icon>
        </button>
        <mat-menu #exportMenu="matMenu">
          <button mat-menu-item (click)="exportarPdf()" [disabled]="exportando">
            <mat-icon>picture_as_pdf</mat-icon>
            <span>Exportar PDF</span>
          </button>
          <button mat-menu-item (click)="exportarExcel()" [disabled]="exportando">
            <mat-icon>table_chart</mat-icon>
            <span>Exportar Excel</span>
          </button>
        </mat-menu>
      }
    </mat-toolbar>

    <div class="reportes-container">
      <!-- Loading -->
      @if (cargando) {
        <div class="loading-state">
          <mat-spinner></mat-spinner>
        </div>
      }

      <!-- Error State -->
      @if (error && !cargando) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon class="error-icon">error_outline</mat-icon>
            <div class="error-message">{{ error }}</div>
            <button mat-raised-button color="primary" (click)="cargarReporte()" style="margin-top: 12px;">
              Reintentar
            </button>
          </mat-card-content>
        </mat-card>
      }

      <!-- Selector de mes (siempre visible cuando no hay error ni loading) -->
      @if (!cargando && !error) {
        <app-reporte-month-selector
          [mesLabel]="nombreMes(mesActual) + ' ' + anioActual"
          [isCurrentMonth]="esMesActual()"
          (anterior)="mesAnterior()"
          (siguiente)="mesSiguiente()">
        </app-reporte-month-selector>
      }

      <!-- Sin datos -->
      @if (!cargando && !error && reporte && reporte.cantidadGastos === 0) {
        <mat-card class="empty-card">
          <mat-card-content>
            <mat-icon class="empty-icon">receipt_long</mat-icon>
            <h3>Sin gastos este mes</h3>
            <p>No hay gastos registrados para {{ nombreMes(mesActual) }} {{ anioActual }}</p>
          </mat-card-content>
        </mat-card>
      }

      @if (!cargando && !error && reporte && reporte.cantidadGastos > 0) {
        <!-- Resumen principal -->
        <div class="summary-grid">
          <app-reporte-summary-card
            type="total"
            icon="account_balance_wallet"
            label="Total del Mes"
            [value]="reporte.gastoTotalMes"
            [count]="reporte.cantidadGastos + ' gastos'">
          </app-reporte-summary-card>

          <app-reporte-summary-card
            type="user1"
            icon="person"
            [label]="reporte.nombreUsuario1"
            [value]="reporte.gastoUsuario1">
          </app-reporte-summary-card>

          <app-reporte-summary-card
            type="user2"
            icon="person"
            [label]="reporte.nombreUsuario2"
            [value]="reporte.gastoUsuario2">
          </app-reporte-summary-card>
        </div>

        <!-- Balance / Deuda -->
        <app-reporte-balance-bar
          [balanceText]="reporte.detalleDeuda"
          [isBalanced]="reporte.saldoQuienDebe === 0"
          [nombreUsuario1]="reporte.nombreUsuario1"
          [nombreUsuario2]="reporte.nombreUsuario2"
          [porcentajeUsuario1]="getPorcentajeUsuario(1)"
          [porcentajeUsuario2]="getPorcentajeUsuario(2)">
        </app-reporte-balance-bar>

        <!-- Pie Chart: Gastos por Categoría -->
        @if (reporte.gastosPorCategoria && reporte.gastosPorCategoria.length > 0) {
          <app-reporte-pie-chart [categorias]="reporte.gastosPorCategoria"></app-reporte-pie-chart>
        }

        <!-- Bar Chart: Comparativo por Categoría -->
        @if (reporte.gastosPorCategoria && reporte.gastosPorCategoria.length > 0) {
          <app-reporte-bar-chart [categorias]="reporte.gastosPorCategoria"></app-reporte-bar-chart>
        }

        <!-- Gastos por Categoría (lista detallada) -->
        @if (reporte.gastosPorCategoria && reporte.gastosPorCategoria.length > 0) {
          <app-reporte-categoria-detail [categorias]="reporte.gastosPorCategoria"></app-reporte-categoria-detail>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg-tertiary, #f5f5f5);
    }

    mat-toolbar {
      flex-shrink: 0;
      background: var(--primary-color, #1976d2);
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      button { color: white; }
      span { font-weight: 500; font-size: 20px; flex: 1; margin-left: 16px; }
    }

    .reportes-container {
      flex: 1;
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 80px 0;
    }

    .error-card, .empty-card {
      text-align: center;
      margin-top: 40px;
      .error-icon, .empty-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: rgba(0,0,0,0.3);
        margin-bottom: 12px;
      }
      .error-message { color: rgba(0,0,0,0.6); }
      h3 { margin: 8px 0 4px; color: rgba(0,0,0,0.7); }
      p { color: rgba(0,0,0,0.5); margin: 0; }
    }

    /* Summary grid */
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    /* Styles for sub-components moved to their respective component files */
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  reporte: any = null;
  cargando = false;
  exportando = false;
  error: string | null = null;
  mesActual: number;
  anioActual: number;

  private meses = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    const hoy = new Date();
    this.mesActual = hoy.getMonth() + 1;
    this.anioActual = hoy.getFullYear();
  }

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando = true;
    this.error = null;
    this.apiService.getReporteMensual(this.mesActual, this.anioActual).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.reporte = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar reporte:', err);
        if (err.status === 400) {
          this.error = 'Necesitas configurar tu pareja antes de ver reportes.';
        } else {
          this.error = 'No se pudo cargar el reporte.';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  nombreMes(mes: number): string {
    return this.meses[mes] || '';
  }

  mesAnterior(): void {
    if (this.mesActual === 1) {
      this.mesActual = 12;
      this.anioActual--;
    } else {
      this.mesActual--;
    }
    this.cargarReporte();
  }

  mesSiguiente(): void {
    if (this.mesActual === 12) {
      this.mesActual = 1;
      this.anioActual++;
    } else {
      this.mesActual++;
    }
    this.cargarReporte();
  }

  esMesActual(): boolean {
    const hoy = new Date();
    return this.mesActual === hoy.getMonth() + 1 && this.anioActual === hoy.getFullYear();
  }

  getPorcentajeUsuario(num: number): number {
    if (!this.reporte || this.reporte.gastoTotalMes === 0) return 50;
    const total = this.reporte.gastoUsuario1 + this.reporte.gastoUsuario2;
    if (total === 0) return 50;
    if (num === 1) return (this.reporte.gastoUsuario1 / total) * 100;
    return (this.reporte.gastoUsuario2 / total) * 100;
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  exportarPdf(): void {
    const { desde, hasta } = this.getRangoMes();
    this.exportando = true;
    this.apiService.exportarPdf(desde, hasta).pipe(takeUntil(this.destroy$)).subscribe({
      next: (blob) => {
        this.descargarArchivo(blob, `gastos_${this.nombreMes(this.mesActual)}_${this.anioActual}.pdf`);
        this.exportando = false;
      },
      error: () => {
        this.notificationService.error('Error al exportar PDF');
        this.exportando = false;
      }
    });
  }

  exportarExcel(): void {
    const { desde, hasta } = this.getRangoMes();
    this.exportando = true;
    this.apiService.exportarExcel(desde, hasta).pipe(takeUntil(this.destroy$)).subscribe({
      next: (blob) => {
        this.descargarArchivo(blob, `gastos_${this.nombreMes(this.mesActual)}_${this.anioActual}.xlsx`);
        this.exportando = false;
      },
      error: () => {
        this.notificationService.error('Error al exportar Excel');
        this.exportando = false;
      }
    });
  }

  private getRangoMes(): { desde: string; hasta: string } {
    const desde = `${this.anioActual}-${String(this.mesActual).padStart(2, '0')}-01`;
    const lastDay = new Date(this.anioActual, this.mesActual, 0).getDate();
    const hasta = `${this.anioActual}-${String(this.mesActual).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { desde, hasta };
  }

  private descargarArchivo(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
