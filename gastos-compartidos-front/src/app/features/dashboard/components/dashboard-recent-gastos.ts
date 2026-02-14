import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Gasto } from '../../../core/services/gasto.service';

@Component({
  selector: 'app-dashboard-recent-gastos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="gastos-card">
      <mat-card-header>
        <mat-card-title>{{ 'DASHBOARD.RECENT_EXPENSES' | translate }}</mat-card-title>
        <button mat-icon-button routerLink="/gastos" class="view-all-btn">
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </mat-card-header>
      <mat-divider></mat-divider>
      <mat-card-content>
        @for (gasto of gastos; track gasto.id) {
          <div class="gasto-item">
            <div class="gasto-row">
              <div class="gasto-info">
                <div class="gasto-descripcion">{{ gasto.descripcion }}</div>
                <div class="gasto-fecha">{{ gasto.fechaCreacion | date: 'dd/MM/yyyy HH:mm' }}</div>
              </div>
              <div class="gasto-monto">
                ${{ gasto.monto | number: '1.2-2' }}
              </div>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .gastos-card {
      margin-bottom: 16px;
      border-radius: 12px;
      box-shadow: var(--shadow-md);
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    mat-card-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .view-all-btn {
      color: var(--primary-color);
    }

    mat-card-content {
      padding: 0;
    }

    .gasto-item {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      transition: background-color 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: var(--bg-tertiary);
      }
    }

    .gasto-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .gasto-info {
      flex: 1;
    }

    .gasto-descripcion {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .gasto-fecha {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .gasto-monto {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-color);
      margin-left: 16px;
    }
  `]
})
export class DashboardRecentGastosComponent {
  @Input({ required: true }) gastos!: Gasto[];
}
