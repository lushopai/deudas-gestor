import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reporte-balance-bar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="balance-card">
      <mat-card-content>
        <div class="balance-header">
          <mat-icon [class]="isBalanced ? 'balance-ok' : 'balance-pending'">
            {{ isBalanced ? 'check_circle' : 'swap_horiz' }}
          </mat-icon>
          <span class="balance-text">{{ balanceText }}</span>
        </div>

        <!-- Barra comparativa -->
        <div class="compare-bar">
          <div class="compare-segment user1-seg" [style.width.%]="porcentajeUsuario1">
            <span class="seg-label">{{ nombreUsuario1 }}</span>
          </div>
          <div class="compare-segment user2-seg" [style.width.%]="porcentajeUsuario2">
            <span class="seg-label">{{ nombreUsuario2 }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .balance-card {
      margin-bottom: 16px;

      mat-card-content {
        padding: 16px !important;
      }

      .balance-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
      }

      .balance-ok {
        color: #4caf50;
      }

      .balance-pending {
        color: #ff9800;
      }

      .balance-text {
        font-size: 15px;
        font-weight: 500;
        color: var(--text-primary, rgba(0,0,0,0.8));
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

      &.user1-seg {
        background: #42a5f5;
      }

      &.user2-seg {
        background: #ef5350;
      }
    }
  `]
})
export class ReporteBalanceBarComponent {
  @Input({ required: true }) balanceText!: string;
  @Input({ required: true }) isBalanced!: boolean;
  @Input({ required: true }) nombreUsuario1!: string;
  @Input({ required: true }) nombreUsuario2!: string;
  @Input({ required: true }) porcentajeUsuario1!: number;
  @Input({ required: true }) porcentajeUsuario2!: number;
}
