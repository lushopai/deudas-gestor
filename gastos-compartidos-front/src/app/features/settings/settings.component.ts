import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { PushNotificationService } from '../../core/services/push-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettingsLanguageComponent } from './components/settings-language';
import { SettingsAppearanceComponent } from './components/settings-appearance';
import { SettingsNotificationsComponent } from './components/settings-notifications';
import { SettingsPushComponent } from './components/settings-push';
import { SettingsDataComponent } from './components/settings-data';
import { SettingsCategoriesComponent } from './components/settings-categories';

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
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    SettingsLanguageComponent,
    SettingsAppearanceComponent,
    SettingsNotificationsComponent,
    SettingsPushComponent,
    SettingsDataComponent,
    SettingsCategoriesComponent
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
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

  // Push notifications state
  pushSupported = false;
  pushSubscribed = false;
  pushLoading = false;
  pushPermission: NotificationPermission = 'default';

  currentLang = 'es';

  private readonly SETTINGS_KEY = 'gastos_settings';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private pushService: PushNotificationService,
    private translate: TranslateService
  ) {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'es';
  }

  ngOnInit(): void {
    this.cargarSettings();
    this.cargarCategorias();
    this.initPush();
    this.currentLang = this.translate.currentLang || 'es';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Event handlers for child components
  onLanguageChanged(lang: string): void {
    this.cambiarIdioma(lang);
  }

  onDarkModeToggled(): void {
    this.settings.darkMode = !this.settings.darkMode;
    this.toggleDarkMode();
  }

  onNotificationSettingChanged(event: { field: string; value: boolean }): void {
    (this.settings as any)[event.field] = event.value;
    this.guardarSettings();
  }

  onPushToggled(): void {
    this.togglePushNotifications();
  }

  onPushTested(): void {
    this.testPush();
  }

  onExportData(): void {
    this.exportarDatos();
  }

  onOpenProfile(): void {
    this.abrirPerfil();
  }

  onConfigurePartner(): void {
    this.configurarPareja();
  }

  // Service methods
  private cambiarIdioma(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('gastos_lang', lang);
    this.cdr.detectChanges();
  }

  private initPush(): void {
    this.pushSupported = this.pushService.isSupported();
    this.pushPermission = this.pushService.getPermissionState();
    if (this.pushSupported) {
      this.pushService.isSubscribed$.pipe(takeUntil(this.destroy$)).subscribe(subscribed => {
        this.pushSubscribed = subscribed;
        this.cdr.detectChanges();
      });
    }
  }

  private togglePushNotifications(): void {
    this.pushLoading = true;
    if (this.pushSubscribed) {
      this.pushService.unsubscribe().pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.notificationService.toast('Notificaciones push desactivadas', 'info');
          this.pushLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.pushLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.pushService.subscribe().pipe(takeUntil(this.destroy$)).subscribe({
        next: (result) => {
          if (result?.error) {
            this.notificationService.error(result.error);
          } else {
            this.notificationService.success('¡Notificaciones push activadas!');
          }
          this.pushLoading = false;
          this.pushPermission = this.pushService.getPermissionState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.pushLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private testPush(): void {
    this.pushLoading = true;
    this.pushService.testNotification().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.toast('Notificación de prueba enviada', 'info');
        this.pushLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('No se pudo enviar la notificación');
        this.pushLoading = false;
        this.cdr.detectChanges();
      }
    });
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

  private guardarSettings(): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({
      recordatoriosActivos: this.settings.recordatoriosActivos,
      recordatorioRecurrentes: this.settings.recordatorioRecurrentes,
      recordatorioDeudas: this.settings.recordatorioDeudas
    }));
  }

  private toggleDarkMode(): void {
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

  private exportarDatos(): void {
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

  private abrirPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  private configurarPareja(): void {
    this.router.navigate(['/pareja/configurar']);
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
