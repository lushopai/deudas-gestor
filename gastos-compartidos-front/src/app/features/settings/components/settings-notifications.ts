import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  template: `
    <mat-card class="settings-section">
      <div class="section-header">
        <mat-icon class="section-icon">notifications</mat-icon>
        <span class="section-title">Notificaciones</span>
      </div>
      <mat-divider></mat-divider>

      <div class="setting-item">
        <div class="setting-info">
          <mat-icon>notifications_active</mat-icon>
          <div class="setting-text">
            <span class="setting-label">Recordatorios</span>
            <span class="setting-desc">Recordatorios al abrir la app</span>
          </div>
        </div>
        <mat-slide-toggle
          [checked]="recordatoriosActivos"
          (change)="onToggle('recordatoriosActivos', $event.checked)"
          color="primary">
        </mat-slide-toggle>
      </div>

      <div class="setting-item" [class.disabled]="!recordatoriosActivos">
        <div class="setting-info">
          <mat-icon>autorenew</mat-icon>
          <div class="setting-text">
            <span class="setting-label">Gastos Recurrentes</span>
            <span class="setting-desc">Avisar de gastos recurrentes pendientes</span>
          </div>
        </div>
        <mat-slide-toggle
          [checked]="recordatorioRecurrentes"
          [disabled]="!recordatoriosActivos"
          (change)="onToggle('recordatorioRecurrentes', $event.checked)"
          color="primary">
        </mat-slide-toggle>
      </div>

      <div class="setting-item" [class.disabled]="!recordatoriosActivos">
        <div class="setting-info">
          <mat-icon>account_balance</mat-icon>
          <div class="setting-text">
            <span class="setting-label">Deudas por Vencer</span>
            <span class="setting-desc">Avisar de deudas próximas a vencer</span>
          </div>
        </div>
        <mat-slide-toggle
          [checked]="recordatorioDeudas"
          [disabled]="!recordatoriosActivos"
          (change)="onToggle('recordatorioDeudas', $event.checked)"
          color="primary">
        </mat-slide-toggle>
      </div>
    </mat-card>
  `,
  styles: [`
    .settings-section {
      border-radius: 12px;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;

      .section-icon {
        color: var(--primary-color, #1976d2);
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary, rgba(0,0,0,0.87));
      }
    }

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.06));

      &:last-child {
        border-bottom: none;
      }

      &.disabled {
        opacity: 0.5;
      }
    }

    .setting-info {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;

      mat-icon {
        color: var(--text-secondary, rgba(0,0,0,0.54));
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .setting-text {
      display: flex;
      flex-direction: column;
    }

    .setting-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, rgba(0,0,0,0.87));
    }

    .setting-desc {
      font-size: 12px;
      color: var(--text-secondary, rgba(0,0,0,0.54));
      margin-top: 2px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsNotificationsComponent {
  @Input({ required: true }) recordatoriosActivos!: boolean;
  @Input({ required: true }) recordatorioRecurrentes!: boolean;
  @Input({ required: true }) recordatorioDeudas!: boolean;

  @Output() settingChanged = new EventEmitter<{
    field: 'recordatoriosActivos' | 'recordatorioRecurrentes' | 'recordatorioDeudas';
    value: boolean;
  }>();

  onToggle(field: 'recordatoriosActivos' | 'recordatorioRecurrentes' | 'recordatorioDeudas', value: boolean): void {
    this.settingChanged.emit({ field, value });
  }
}
