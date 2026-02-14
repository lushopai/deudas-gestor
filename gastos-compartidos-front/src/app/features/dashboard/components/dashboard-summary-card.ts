import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-summary-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="stat-card">
      <mat-icon class="stat-icon">{{ icon }}</mat-icon>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
      @if (detail) {
        <div class="stat-detail">{{ detail }}</div>
      }
    </mat-card>
  `,
  styles: [`
    .stat-card {
      padding: 20px;
      text-align: center;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      background: var(--bg-primary);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .stat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--primary-color);
      margin-bottom: 12px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .stat-detail {
      font-size: 12px;
      color: var(--text-tertiary);
    }
  `]
})
export class DashboardSummaryCardComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) value!: string;
  @Input({ required: true }) label!: string;
  @Input() detail?: string;
}
