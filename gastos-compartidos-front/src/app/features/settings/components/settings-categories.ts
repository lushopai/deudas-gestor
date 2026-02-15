import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface Categoria {
  id: number;
  nombre: string;
  icono: string;
}

@Component({
  selector: 'app-settings-categories',
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
        <mat-icon class="section-icon">category</mat-icon>
        <span class="section-title">Categorías</span>
      </div>
      <mat-divider></mat-divider>

      @if (categorias.length > 0) {
        <div class="categorias-grid">
          @for (cat of categorias; track cat.id) {
            <div class="categoria-chip">
              <span class="cat-icono">{{ cat.icono }}</span>
              <span class="cat-nombre">{{ cat.nombre }}</span>
            </div>
          }
        </div>
      } @else {
        <div class="setting-item">
          <div class="setting-info">
            <mat-icon>info_outline</mat-icon>
            <span class="setting-label" style="color: var(--text-secondary)">Cargando categorías...</span>
          </div>
        </div>
      }
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

    .categorias-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 16px;
    }

    .categoria-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--bg-secondary, rgba(0,0,0,0.04));
      border-radius: 20px;
      font-size: 13px;

      .cat-icono {
        font-size: 16px;
      }

      .cat-nombre {
        color: var(--text-primary, rgba(0,0,0,0.87));
        font-weight: 500;
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

    .setting-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, rgba(0,0,0,0.87));
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCategoriesComponent {
  @Input({ required: true }) categorias!: Categoria[];
}
