import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../../core/services/api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-reporte-tendencia',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, MatProgressSpinnerModule, BaseChartDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <mat-card class="chart-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>trending_up</mat-icon>
          Tendencia Mensual
        </mat-card-title>
      </mat-card-header>
      <mat-divider></mat-divider>
      <mat-card-content>
        @if (cargando) {
          <div class="loading">
            <mat-spinner diameter="32"></mat-spinner>
          </div>
        } @else if (sinDatos) {
          <div class="sin-datos">
            <mat-icon>show_chart</mat-icon>
            <p>Sin datos suficientes para mostrar tendencia</p>
          </div>
        } @else {
          <div class="chart-wrapper">
            <canvas baseChart
              [data]="lineChartData"
              [options]="lineChartOptions"
              type="line">
            </canvas>
          </div>
          @if (variacion !== null) {
            <div class="variacion" [class.positiva]="variacion > 0" [class.negativa]="variacion < 0" [class.neutra]="variacion === 0">
              <mat-icon>{{ variacion > 0 ? 'trending_up' : variacion < 0 ? 'trending_down' : 'trending_flat' }}</mat-icon>
              <span>
                {{ variacion > 0 ? '+' : '' }}{{ variacion | number:'1.1-1' }}%
                vs mes anterior
              </span>
            </div>
          }
        }
      </mat-card-content>
    </mat-card>
  `,
    styles: [`
    .chart-card {
      margin-bottom: 16px;

      mat-card-header { padding: 16px 16px 12px; }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;

        mat-icon {
          color: var(--primary-color, #1976d2);
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
      }

      mat-card-content {
        padding: 12px 16px 16px !important;
      }
    }

    .chart-wrapper {
      position: relative;
      width: 100%;
      padding: 8px 0;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 40px 0;
    }

    .sin-datos {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 0;
      color: rgba(0,0,0,0.4);

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        margin-bottom: 8px;
      }

      p { margin: 0; font-size: 14px; }
    }

    .variacion {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      margin-top: 8px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &.positiva {
        background: rgba(244, 67, 54, 0.08);
        color: #d32f2f;
      }

      &.negativa {
        background: rgba(76, 175, 80, 0.08);
        color: #388e3c;
      }

      &.neutra {
        background: rgba(158, 158, 158, 0.08);
        color: #616161;
      }
    }
  `]
})
export class ReporteTendenciaComponent implements OnInit, OnDestroy {
    @Input() meses = 6;

    private destroy$ = new Subject<void>();
    cargando = true;
    sinDatos = false;
    variacion: number | null = null;

    lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
    lineChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                titleFont: { size: 13, family: 'Roboto' },
                bodyFont: { size: 12, family: 'Roboto' },
                callbacks: {
                    label: (ctx) => ` Total: $${(ctx.parsed.y ?? 0).toLocaleString('es-CL')}`,
                    afterLabel: (ctx) => {
                        const raw = (ctx.raw as any);
                        return raw?.cantidad ? `  ${raw.cantidad} gastos` : '';
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 12, family: 'Roboto' } }
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.06)' },
                ticks: {
                    font: { size: 11, family: 'Roboto' },
                    callback: (value) => '$' + Number(value).toLocaleString('es-CL')
                }
            }
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 3,
                borderColor: '#1976d2',
                fill: true,
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
            },
            point: {
                radius: 5,
                hoverRadius: 7,
                backgroundColor: '#1976d2',
                borderColor: '#fff',
                borderWidth: 2
            }
        }
    };

    constructor(
        private apiService: ApiService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargarTendencia();
    }

    private cargarTendencia(): void {
        this.apiService.getTendenciaMensual(this.meses).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                if (!data || data.length === 0 || data.every((d: any) => d.total === 0)) {
                    this.sinDatos = true;
                    this.cargando = false;
                    this.cdr.detectChanges();
                    return;
                }

                const labels = data.map((d: any) => d.nombreMes);
                const totales = data.map((d: any) => d.total);

                this.lineChartData = {
                    labels,
                    datasets: [{
                        data: totales.map((t: number, i: number) => ({
                            x: i,
                            y: t,
                            cantidad: data[i].cantidadGastos
                        })),
                        parsing: { xAxisKey: 'x', yAxisKey: 'y' }
                    }]
                };

                // Calcular variación mes actual vs anterior
                if (data.length >= 2) {
                    const actual = data[data.length - 1].total;
                    const anterior = data[data.length - 2].total;
                    if (anterior > 0) {
                        this.variacion = ((actual - anterior) / anterior) * 100;
                    } else if (actual > 0) {
                        this.variacion = 100;
                    } else {
                        this.variacion = 0;
                    }
                }

                this.cargando = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.sinDatos = true;
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
