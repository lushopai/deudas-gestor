import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reporte-month-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mes-selector">
      <button mat-icon-button (click)="anterior.emit()">
        <mat-icon>chevron_left</mat-icon>
      </button>
      <span class="mes-label">{{ mesLabel }}</span>
      <button mat-icon-button (click)="siguiente.emit()" [disabled]="isCurrentMonth">
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .mes-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;

      .mes-label {
        font-size: 18px;
        font-weight: 500;
        min-width: 180px;
        text-align: center;
        color: var(--text-primary, rgba(0,0,0,0.87));
      }
    }
  `]
})
export class ReporteMonthSelectorComponent {
  @Input({ required: true }) mesLabel!: string;
  @Input({ required: true }) isCurrentMonth!: boolean;
  @Output() anterior = new EventEmitter<void>();
  @Output() siguiente = new EventEmitter<void>();
}
