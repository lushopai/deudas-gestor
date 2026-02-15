import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-settings-data',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <mat-card class="settings-section">
      <div class="section-header">
        <mat-icon class="section-icon">storage</mat-icon>
        <span class="section-title">Datos</span>
      </div>
      <mat-divider></mat-divider>

      <button class="setting-action" (click)="exportData.emit()">
        <div class="setting-info">
          <mat-icon>file_download</mat-icon>
          <div class="setting-text">
            <span class="setting-label">Exportar Mis Datos</span>
            <span class="setting-desc">Descargar todos tus gastos en Excel</span>
          </div>
        </div>
        <mat-icon class="action-arrow">chevron_right</mat-icon>
      </button>

      <button class="setting-action" (click)="openProfile.emit()">
        <div class="setting-info">
          <mat-icon>person</mat-icon>
          <div class="setting-text">
            <span class="setting-label">Mi Perfil</span>
            <span class="setting-desc">Editar información personal y contraseña</span>
          </div>
        </div>
        <mat-icon class="action-arrow">chevron_right</mat-icon>
      </button>

      <button class="setting-action" (click)="configurePartner.emit()">
        <div class="setting-info">
          <mat-icon>people</mat-icon>
          <div class="setting-text">
            <span class="setting-label">Configurar Pareja</span>
            <span class="setting-desc">Gestionar tu pareja para gastos compartidos</span>
          </div>
        </div>
        <mat-icon class="action-arrow">chevron_right</mat-icon>
      </button>
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

    .setting-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 14px 16px;
      background: none;
      border: none;
      border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.06));
      cursor: pointer;
      transition: background 0.15s;
      text-align: left;

      &:last-of-type {
        border-bottom: none;
      }

      &:hover {
        background: var(--bg-hover, rgba(0,0,0,0.04));
      }

      &:active {
        background: var(--bg-hover, rgba(0,0,0,0.08));
      }

      .action-arrow {
        color: var(--text-tertiary, rgba(0,0,0,0.3));
        font-size: 20px;
        width: 20px;
        height: 20px;
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
export class SettingsDataComponent {
  @Output() exportData = new EventEmitter<void>();
  @Output() openProfile = new EventEmitter<void>();
  @Output() configurePartner = new EventEmitter<void>();
}
