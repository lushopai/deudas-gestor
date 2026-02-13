import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { GastoRecurrenteService } from '../../core/services/gasto-recurrente.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface SettingsData {
  darkMode: boolean;
  recordatoriosActivos: boolean;
  recordatorioRecurrentes: boolean;
  recordatorioDeudas: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatListModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="volver()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>Configuración</span>
    </mat-toolbar>

    <div class="settings-container">
      <!-- Apariencia -->
      <mat-card class="settings-section">
        <div class="section-header">
          <mat-icon class="section-icon">palette</mat-icon>
          <span class="section-title">Apariencia</span>
        </div>
        <mat-divider></mat-divider>

        <div class="setting-item">
          <div class="setting-info">
            <mat-icon>{{ settings.darkMode ? 'dark_mode' : 'light_mode' }}</mat-icon>
            <div class="setting-text">
              <span class="setting-label">Modo Oscuro</span>
              <span class="setting-desc">Cambia la apariencia de la app</span>
            </div>
          </div>
          <mat-slide-toggle
            [(ngModel)]="settings.darkMode"
            (change)="toggleDarkMode()"
            color="primary">
          </mat-slide-toggle>
        </div>
      </mat-card>

      <!-- Notificaciones -->
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
            [(ngModel)]="settings.recordatoriosActivos"
            (change)="guardarSettings()"
            color="primary">
          </mat-slide-toggle>
        </div>

        <div class="setting-item" [class.disabled]="!settings.recordatoriosActivos">
          <div class="setting-info">
            <mat-icon>autorenew</mat-icon>
            <div class="setting-text">
              <span class="setting-label">Gastos Recurrentes</span>
              <span class="setting-desc">Avisar de gastos recurrentes pendientes</span>
            </div>
          </div>
          <mat-slide-toggle
            [(ngModel)]="settings.recordatorioRecurrentes"
            [disabled]="!settings.recordatoriosActivos"
            (change)="guardarSettings()"
            color="primary">
          </mat-slide-toggle>
        </div>

        <div class="setting-item" [class.disabled]="!settings.recordatoriosActivos">
          <div class="setting-info">
            <mat-icon>account_balance</mat-icon>
            <div class="setting-text">
              <span class="setting-label">Deudas por Vencer</span>
              <span class="setting-desc">Avisar de deudas próximas a vencer</span>
            </div>
          </div>
          <mat-slide-toggle
            [(ngModel)]="settings.recordatorioDeudas"
            [disabled]="!settings.recordatoriosActivos"
            (change)="guardarSettings()"
            color="primary">
          </mat-slide-toggle>
        </div>
      </mat-card>

      <!-- Datos -->
      <mat-card class="settings-section">
        <div class="section-header">
          <mat-icon class="section-icon">storage</mat-icon>
          <span class="section-title">Datos</span>
        </div>
        <mat-divider></mat-divider>

        <button class="setting-action" (click)="exportarDatos()">
          <div class="setting-info">
            <mat-icon>file_download</mat-icon>
            <div class="setting-text">
              <span class="setting-label">Exportar Mis Datos</span>
              <span class="setting-desc">Descargar todos tus gastos en Excel</span>
            </div>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </button>

        <button class="setting-action" (click)="abrirPerfil()">
          <div class="setting-info">
            <mat-icon>person</mat-icon>
            <div class="setting-text">
              <span class="setting-label">Mi Perfil</span>
              <span class="setting-desc">Editar información personal y contraseña</span>
            </div>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </button>

        <button class="setting-action" (click)="configurarPareja()">
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

      <!-- Categorías -->
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

      <!-- Info de la App -->
      <mat-card class="settings-section app-info">
        <div class="app-info-content">
          <mat-icon class="app-logo">account_balance_wallet</mat-icon>
          <span class="app-name">Gastos Compartidos</span>
          <span class="app-version">v1.0.0</span>
        </div>
      </mat-card>

      <!-- Cerrar Sesión -->
      <button class="logout-btn" (click)="cerrarSesion()">
        <mat-icon>logout</mat-icon>
        <span>Cerrar Sesión</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg-tertiary, #f5f5f5);
    }

    mat-toolbar {
      flex-shrink: 0;
      background: var(--primary-color, #1976d2);
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      button { color: white; }
      span { font-weight: 500; font-size: 20px; flex: 1; margin-left: 16px; }
    }

    .settings-container {
      flex: 1;
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

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

      &:last-child { border-bottom: none; }

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

      &:last-of-type { border-bottom: none; }

      &:hover { background: var(--bg-hover, rgba(0,0,0,0.04)); }
      &:active { background: var(--bg-hover, rgba(0,0,0,0.08)); }

      .action-arrow {
        color: var(--text-tertiary, rgba(0,0,0,0.3));
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    /* Categorías */
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

      .cat-icono { font-size: 16px; }
      .cat-nombre {
        color: var(--text-primary, rgba(0,0,0,0.87));
        font-weight: 500;
      }
    }

    /* App Info */
    .app-info {
      .app-info-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px 16px;
        gap: 8px;
      }

      .app-logo {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: var(--primary-color, #1976d2);
        opacity: 0.6;
      }

      .app-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary, rgba(0,0,0,0.87));
      }

      .app-version {
        font-size: 12px;
        color: var(--text-tertiary, rgba(0,0,0,0.3));
      }
    }

    /* Logout */
    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      background: none;
      border: 1px solid #ef5350;
      border-radius: 12px;
      color: #ef5350;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 24px;

      &:hover {
        background: #ef5350;
        color: white;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  settings: SettingsData = {
    darkMode: false,
    recordatoriosActivos: true,
    recordatorioRecurrentes: true,
    recordatorioDeudas: true
  };

  categorias: { id: number; nombre: string; icono: string }[] = [];

  private readonly SETTINGS_KEY = 'gastos_settings';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private gastoRecurrenteService: GastoRecurrenteService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarSettings();
    this.cargarCategorias();
  }

  private cargarSettings(): void {
    // Dark mode desde localStorage existente
    this.settings.darkMode = localStorage.getItem('gastos_theme') === 'dark';

    // Settings propios
    try {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings.recordatoriosActivos = parsed.recordatoriosActivos ?? true;
        this.settings.recordatorioRecurrentes = parsed.recordatorioRecurrentes ?? true;
        this.settings.recordatorioDeudas = parsed.recordatorioDeudas ?? true;
      }
    } catch {
      // defaults ya están seteados
    }
  }

  guardarSettings(): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({
      recordatoriosActivos: this.settings.recordatoriosActivos,
      recordatorioRecurrentes: this.settings.recordatorioRecurrentes,
      recordatorioDeudas: this.settings.recordatorioDeudas
    }));
  }

  toggleDarkMode(): void {
    if (this.settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('gastos_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('gastos_theme', 'light');
    }
  }

  private cargarCategorias(): void {
    this.apiService.getCategorias().pipe(takeUntil(this.destroy$)).subscribe({
      next: (cats: any[]) => {
        this.categorias = cats.map(c => ({
          id: c.id,
          nombre: c.nombre,
          icono: c.icono || ''
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.categorias = [];
        this.cdr.detectChanges();
      }
    });
  }

  exportarDatos(): void {
    const now = new Date();
    const desde = `${now.getFullYear()}-01-01`;
    const hasta = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    this.notificationService.toast('Generando archivo...', 'info');

    this.apiService.exportarExcel(desde, hasta).pipe(takeUntil(this.destroy$)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gastos_${now.getFullYear()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.success('Archivo descargado');
      },
      error: () => {
        this.notificationService.error('No se pudo exportar los datos');
      }
    });
  }

  abrirPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  configurarPareja(): void {
    this.router.navigate(['/pareja/configurar']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
