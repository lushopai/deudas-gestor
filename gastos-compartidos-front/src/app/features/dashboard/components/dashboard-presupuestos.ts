import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Presupuesto } from '../../../core/services/presupuesto.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-presupuestos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressBarModule,
    TranslateModule
  ],
  template: `
    @if (!cargando && presupuestos.length > 0) {
      <mat-card class="presupuestos-card">
        <mat-card-header>
          <mat-card-title>{{ 'DASHBOARD.BUDGETS_MONTH' | translate }}</mat-card-title>
          <button mat-icon-button routerLink="/presupuestos" class="view-all-btn">
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </mat-card-header>
        <mat-divider></mat-divider>
        <mat-card-content>
          @for (p of presupuestos; track p.id) {
            <div class="presupuesto-item" [class.alerta]="p.estado === 'ALERTA'" [class.excedido]="p.estado === 'EXCEDIDO'">
              <div class="presupuesto-header">
                <div class="presupuesto-info">
                  <mat-icon>{{ p.categoriaIcono }}</mat-icon>
                  <span class="presupuesto-nombre">{{ p.categoriaNombre }}</span>
                </div>
                <div class="presupuesto-montos">
                  <span class="presupuesto-gastado">\${{ p.gastado | number: '1.0-0' }}</span>
                  <span class="presupuesto-separador">/</span>
                  <span class="presupuesto-limite">\${{ p.limite | number: '1.0-0' }}</span>
                </div>
              </div>
              <mat-progress-bar
                mode="determinate"
                [value]="p.porcentajeUsado > 100 ? 100 : p.porcentajeUsado"
                [color]="p.estado === 'EXCEDIDO' ? 'warn' : (p.estado === 'ALERTA' ? 'accent' : 'primary')"
                class="presupuesto-progress">
              </mat-progress-bar>
              <div class="presupuesto-footer">
                <span class="presupuesto-porcentaje">{{ p.porcentajeUsado | number: '1.0-0' }}%</span>
                @if (p.estado === 'EXCEDIDO') {
                  <span class="presupuesto-estado excedido">Excedido por \${{ -p.disponible | number: '1.0-0' }}</span>
                } @else {
                  <span class="presupuesto-estado">Disponible: \${{ p.disponible | number: '1.0-0' }}</span>
                }
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .presupuestos-card {
      margin: 0;
      box-shadow: var(--shadow-sm);

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        margin: 0;
      }

      mat-card-title {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #333;
      }

      mat-card-content {
        padding: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md) !important;
      }
    }

    .presupuesto-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }
    }

    .presupuesto-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .presupuesto-info {
        display: flex;
        align-items: center;
        gap: 8px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          color: #667eea;
        }

        .presupuesto-nombre {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
      }

      .presupuesto-montos {
        font-size: 14px;

        .presupuesto-gastado {
          font-weight: 700;
          color: #333;
        }

        .presupuesto-separador {
          color: #999;
          margin: 0 2px;
        }

        .presupuesto-limite {
          color: #999;
        }
      }
    }

    .presupuesto-progress {
      height: 6px;
      border-radius: 3px;
      margin-bottom: 6px;

      ::ng-deep .mdc-linear-progress__bar-inner {
        border-top-width: 6px;
      }
    }

    .presupuesto-footer {
      display: flex;
      justify-content: space-between;
      font-size: 12px;

      .presupuesto-porcentaje {
        color: #999;
        font-weight: 500;
      }

      .presupuesto-estado {
        color: #4caf50;

        &.excedido {
          color: #f44336;
          font-weight: 600;
        }
      }
    }

    .presupuesto-item.alerta {
      .presupuesto-info mat-icon {
        color: #ff9800;
      }

      .presupuesto-montos .presupuesto-gastado {
        color: #ff9800;
      }
    }

    .presupuesto-item.excedido {
      .presupuesto-info mat-icon {
        color: #f44336;
      }

      .presupuesto-montos .presupuesto-gastado {
        color: #f44336;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPresupuestosComponent {
  @Input({ required: true }) presupuestos!: Presupuesto[];
  @Input({ required: true }) cargando!: boolean;
}
