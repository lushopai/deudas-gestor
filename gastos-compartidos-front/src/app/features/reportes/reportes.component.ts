import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';

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
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="volver()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>Reportes</span>
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
        <!-- Selector de mes -->
        <div class="mes-selector">
          <button mat-icon-button (click)="mesAnterior()">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="mes-label">{{ nombreMes(mesActual) }} {{ anioActual }}</span>
          <button mat-icon-button (click)="mesSiguiente()" [disabled]="esMesActual()">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <!-- Resumen principal -->
        <div class="summary-grid">
          <mat-card class="summary-card total">
            <mat-card-content>
              <mat-icon>account_balance_wallet</mat-icon>
              <div class="summary-info">
                <span class="summary-label">Total del Mes</span>
                <span class="summary-value">\${{ reporte.gastoTotalMes | number:'1.0-0' }}</span>
              </div>
              <span class="summary-count">{{ reporte.cantidadGastos }} gastos</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card user1">
            <mat-card-content>
              <mat-icon>person</mat-icon>
              <div class="summary-info">
                <span class="summary-label">{{ reporte.nombreUsuario1 }}</span>
                <span class="summary-value">\${{ reporte.gastoUsuario1 | number:'1.0-0' }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card user2">
            <mat-card-content>
              <mat-icon>person</mat-icon>
              <div class="summary-info">
                <span class="summary-label">{{ reporte.nombreUsuario2 }}</span>
                <span class="summary-value">\${{ reporte.gastoUsuario2 | number:'1.0-0' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Balance / Deuda -->
        <mat-card class="balance-card">
          <mat-card-content>
            <div class="balance-header">
              <mat-icon [class]="reporte.saldoQuienDebe == 0 ? 'balance-ok' : 'balance-pending'">
                {{ reporte.saldoQuienDebe == 0 ? 'check_circle' : 'swap_horiz' }}
              </mat-icon>
              <span class="balance-text">{{ reporte.detalleDeuda }}</span>
            </div>

            <!-- Barra comparativa -->
            <div class="compare-bar">
              <div class="compare-segment user1-seg"
                [style.width.%]="getPorcentajeUsuario(1)">
                <span class="seg-label">{{ reporte.nombreUsuario1 }}</span>
              </div>
              <div class="compare-segment user2-seg"
                [style.width.%]="getPorcentajeUsuario(2)">
                <span class="seg-label">{{ reporte.nombreUsuario2 }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Gastos por Categoría -->
        @if (reporte.gastosPorCategoria && reporte.gastosPorCategoria.length > 0) {
          <mat-card class="categorias-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>pie_chart</mat-icon>
                Gastos por Categoría
              </mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            <mat-card-content>
              @for (cat of reporte.gastosPorCategoria; track cat.nombre) {
                <div class="categoria-item">
                  <div class="categoria-header">
                    <div class="categoria-info">
                      <span class="cat-icono">{{ cat.icono }}</span>
                      <span class="cat-nombre">{{ cat.nombre }}</span>
                      <span class="cat-count">({{ cat.cantidad }})</span>
                    </div>
                    <div class="categoria-monto">
                      <span class="cat-valor">\${{ cat.monto | number:'1.0-0' }}</span>
                      <span class="cat-pct">{{ cat.porcentaje }}%</span>
                    </div>
                  </div>
                  <div class="categoria-bar">
                    <div class="categoria-bar-fill" [style.width.%]="cat.porcentaje"
                      [style.background-color]="cat.color || '#1976d2'"></div>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    mat-toolbar {
      flex-shrink: 0;
      background: #1976d2;
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

    /* Selector de mes */
    .mes-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
      .mes-label {
        font-size: 18px;
        font-weight: 500;
        min-width: 180px;
        text-align: center;
        color: rgba(0,0,0,0.87);
      }
    }

    /* Summary cards */
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .summary-card {
      mat-card-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px !important;
      }
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        opacity: 0.8;
      }
      .summary-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .summary-label {
        font-size: 13px;
        color: rgba(0,0,0,0.6);
      }
      .summary-value {
        font-size: 22px;
        font-weight: 600;
        color: rgba(0,0,0,0.87);
      }
      .summary-count {
        font-size: 12px;
        color: rgba(0,0,0,0.5);
        background: rgba(0,0,0,0.06);
        padding: 4px 8px;
        border-radius: 12px;
      }
      &.total {
        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
        color: white;
        mat-icon, .summary-label, .summary-value, .summary-count { color: white; }
        .summary-count { background: rgba(255,255,255,0.2); }
      }
      &.user1 { border-left: 4px solid #42a5f5; }
      &.user2 { border-left: 4px solid #ef5350; }
    }

    /* Balance */
    .balance-card {
      margin-bottom: 16px;
      mat-card-content { padding: 16px !important; }
      .balance-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
      }
      .balance-ok { color: #4caf50; }
      .balance-pending { color: #ff9800; }
      .balance-text {
        font-size: 15px;
        font-weight: 500;
        color: rgba(0,0,0,0.8);
      }
    }

    .compare-bar {
      display: flex;
      height: 28px;
      border-radius: 14px;
      overflow: hidden;
      background: #e0e0e0;
    }

    .compare-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 20%;
      transition: width 0.5s ease;
      .seg-label {
        font-size: 11px;
        font-weight: 500;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 8px;
      }
      &.user1-seg { background: #42a5f5; }
      &.user2-seg { background: #ef5350; }
    }

    /* Categorías */
    .categorias-card {
      margin-bottom: 16px;
      mat-card-header { padding: 16px 16px 12px; }
      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        mat-icon { color: #1976d2; font-size: 22px; width: 22px; height: 22px; }
      }
      mat-card-content { padding: 12px 16px 16px !important; }
    }

    .categoria-item {
      margin-bottom: 14px;
      &:last-child { margin-bottom: 0; }
    }

    .categoria-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .categoria-info {
      display: flex;
      align-items: center;
      gap: 8px;
      .cat-icono { font-size: 18px; }
      .cat-nombre { font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.8); }
      .cat-count { font-size: 12px; color: rgba(0,0,0,0.4); }
    }

    .categoria-monto {
      display: flex;
      align-items: center;
      gap: 8px;
      .cat-valor { font-size: 14px; font-weight: 600; color: rgba(0,0,0,0.87); }
      .cat-pct {
        font-size: 11px;
        color: rgba(0,0,0,0.5);
        background: rgba(0,0,0,0.06);
        padding: 2px 6px;
        border-radius: 8px;
      }
    }

    .categoria-bar {
      height: 8px;
      background: #e8e8e8;
      border-radius: 4px;
      overflow: hidden;
    }

    .categoria-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
      min-width: 2%;
    }
  `]
})
export class ReportesComponent implements OnInit {
  reporte: any = null;
  cargando = false;
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
    this.apiService.getReporteMensual(this.mesActual, this.anioActual).subscribe({
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
}
