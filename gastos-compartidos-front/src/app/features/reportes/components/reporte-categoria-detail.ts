import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface CategoriaDetalle {
  nombre: string;
  icono: string;
  monto: number;
  cantidad: number;
  porcentaje: number;
  color?: string;
}

@Component({
  selector: 'app-reporte-categoria-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="categorias-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>format_list_bulleted</mat-icon>
          Detalle por Categoría
        </mat-card-title>
      </mat-card-header>
      <mat-divider></mat-divider>
      <mat-card-content>
        @for (cat of categorias; track cat.nombre) {
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
              <div class="categoria-bar-fill"
                   [style.width.%]="cat.porcentaje"
                   [style.background-color]="cat.color || '#1976d2'">
              </div>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .categorias-card {
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

    .categoria-item {
      margin-bottom: 14px;

      &:last-child {
        margin-bottom: 0;
      }
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

      .cat-icono {
        font-size: 18px;
      }

      .cat-nombre {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary, rgba(0,0,0,0.8));
      }

      .cat-count {
        font-size: 12px;
        color: rgba(0,0,0,0.4);
      }
    }

    .categoria-monto {
      display: flex;
      align-items: center;
      gap: 8px;

      .cat-valor {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary, rgba(0,0,0,0.87));
      }

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
export class ReporteCategoriaDetailComponent {
  @Input({ required: true }) categorias!: CategoriaDetalle[];
}
