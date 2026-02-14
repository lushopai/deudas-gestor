import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="categorias-card">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
      </mat-card-header>
      <mat-divider></mat-divider>
      <mat-card-content>
        @if (pieChartData.labels && pieChartData.labels.length > 0) {
          <div style="display: block; height: 250px;">
            <canvas baseChart
              [data]="pieChartData"
              [type]="pieChartType"
              [options]="pieChartOptions">
            </canvas>
          </div>
        } @else {
          <div class="empty-chart">
            <p>No hay datos para mostrar</p>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .categorias-card {
      margin-bottom: 16px;
      border-radius: 12px;
      box-shadow: var(--shadow-md);
    }

    mat-card-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    mat-card-content {
      padding: 16px;
    }

    .empty-chart {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 250px;
      color: var(--text-secondary);
    }
  `]
})
export class DashboardChartComponent implements OnChanges {
  @Input({ required: true }) gastosPorCategoria!: { [key: string]: number };
  @Input() title = 'Gastos por Categoría';

  pieChartType = 'doughnut' as const;
  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
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
    cutout: '60%'
  };

  pieChartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gastosPorCategoria'] && this.gastosPorCategoria) {
      this.actualizarChart();
    }
  }

  private actualizarChart(): void {
    const labels = Object.keys(this.gastosPorCategoria);
    const data = Object.values(this.gastosPorCategoria);
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

  private generarColores(cantidad: number): string[] {
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
