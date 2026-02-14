import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

export interface CategoriaReporte {
  nombre: string;
  monto: number;
  color?: string;
}

@Component({
  selector: 'app-reporte-bar-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="chart-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>bar_chart</mat-icon>
          Comparativo por Categoría
        </mat-card-title>
      </mat-card-header>
      <mat-divider></mat-divider>
      <mat-card-content>
        <div class="chart-wrapper chart-bar">
          <canvas baseChart
            [data]="barChartData"
            [options]="barChartOptions"
            type="bar">
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

    .chart-bar {
      max-width: 100%;
    }
  `]
})
export class ReporteBarChartComponent implements OnChanges {
  @Input({ required: true }) categorias!: CategoriaReporte[];

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
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
          label: (ctx) => ` ${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toLocaleString('es-CL')}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11 },
          callback: (value) => '$' + Number(value).toLocaleString('es-CL')
        }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categorias'] && this.categorias) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    const labels = this.categorias.map(c => c.nombre);
    const montos = this.categorias.map(c => c.monto);
    const colores = this.categorias.map(c => c.color || '#9e9e9e');

    this.barChartData = {
      labels,
      datasets: [{
        label: 'Monto por categoría',
        data: montos,
        backgroundColor: colores.map(c => c + 'CC'),
        borderColor: colores,
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  }
}
