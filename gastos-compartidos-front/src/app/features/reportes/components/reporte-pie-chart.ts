import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

export interface CategoriaReporte {
  nombre: string;
  icono: string;
  monto: number;
  color?: string;
}

@Component({
  selector: 'app-reporte-pie-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="chart-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>pie_chart</mat-icon>
          Distribución por Categoría
        </mat-card-title>
      </mat-card-header>
      <mat-divider></mat-divider>
      <mat-card-content>
        <div class="chart-wrapper">
          <canvas baseChart
            [data]="pieChartData"
            [options]="pieChartOptions"
            type="doughnut">
          </canvas>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .chart-card {
      margin-bottom: 16px;

      mat-card-header {
        padding: 16px 16px 12px;
      }

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
      max-width: 280px;
      margin: 0 auto;
      padding: 8px 0;
    }
  `]
})
export class ReportePieChartComponent implements OnChanges {
  @Input({ required: true }) categorias!: CategoriaReporte[];

  pieChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12, family: 'Roboto' }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed;
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return ` ${ctx.label}: $${value.toLocaleString('es-CL')} (${pct}%)`;
          }
        }
      }
    },
    cutout: '55%'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categorias'] && this.categorias) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    const labels = this.categorias.map(c => `${c.icono} ${c.nombre}`);
    const montos = this.categorias.map(c => c.monto);
    const colores = this.categorias.map(c => c.color || '#9e9e9e');

    this.pieChartData = {
      labels,
      datasets: [{
        data: montos,
        backgroundColor: colores,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 3
      }]
    };
  }
}
