import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type SummaryCardType = 'total' | 'user1' | 'user2';

@Component({
  selector: 'app-reporte-summary-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="summary-card" [class.total]="type === 'total'"
              [class.user1]="type === 'user1'" [class.user2]="type === 'user2'">
      <mat-card-content>
        <mat-icon>{{ icon }}</mat-icon>
        <div class="summary-info">
          <span class="summary-label">{{ label }}</span>
          <span class="summary-value">\${{ value | number:'1.0-0' }}</span>
        </div>
        @if (count) {
          <span class="summary-count">{{ count }}</span>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
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

        mat-icon, .summary-label, .summary-value, .summary-count {
          color: white;
        }

        .summary-count {
          background: rgba(255,255,255,0.2);
        }
      }

      &.user1 {
        border-left: 4px solid #42a5f5;
      }

      &.user2 {
        border-left: 4px solid #ef5350;
      }
    }
  `]
})
export class ReporteSummaryCardComponent {
  @Input({ required: true }) type!: SummaryCardType;
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number;
  @Input() count?: string;
}
