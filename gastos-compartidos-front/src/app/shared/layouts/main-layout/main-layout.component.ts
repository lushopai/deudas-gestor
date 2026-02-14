import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildrenOutletContexts, RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { routeFadeAnimation } from '../../animations/route-animations';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  isFab?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  animations: [routeFadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  sidenavAberto = false;

  // Signals del AuthService
  usuario = this.authService.usuario;

  darkMode = false;
  currentRoute = '';
  showFab = false;

  menuItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Mis Gastos',
      icon: 'receipt_long',
      route: '/gastos'
    },
    {
      label: 'Deudas',
      icon: 'attach_money',
      route: '/deudas/abonar'
    },
    {
      label: 'Recurrentes',
      icon: 'autorenew',
      route: '/gastos-recurrentes'
    },
    {
      label: 'Reportes',
      icon: 'assessment',
      route: '/reportes'
    },
    {
      label: 'Historial',
      icon: 'history',
      route: '/deudas/historial'
    },
    {
      label: 'Deudas Externas',
      icon: 'account_balance',
      route: '/deudas-externas'
    },
    {
      label: 'Configuración',
      icon: 'settings',
      route: '/settings'
    }
  ];

  bottomNavItems: NavItem[] = [
    { label: 'Inicio', icon: 'home', route: '/dashboard' },
    { label: 'Gastos', icon: 'receipt', route: '/gastos' },
    { label: 'Nuevo', icon: 'add_circle', route: '/gastos/nuevo' },
    { label: 'Deudas', icon: 'attach_money', route: '/deudas/abonar' },
    { label: 'Perfil', icon: 'person', route: '/perfil' }
  ];

  isMobile$: Observable<boolean>;

  private fabRoutes = ['/dashboard', '/gastos'];

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private contexts: ChildrenOutletContexts,
    private cdr: ChangeDetectorRef
  ) {
    this.isMobile$ = this.breakpointObserver.observe('(max-width: 960px)')
      .pipe(map(result => result.matches));
  }

  ngOnInit() {
    // Restaurar preferencia de tema
    const savedTheme = localStorage.getItem('gastos_theme');
    if (savedTheme === 'dark') {
      this.darkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (!savedTheme) {
      // Respetar preferencia del sistema si no hay preferencia guardada
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        this.darkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }

    // Cerrar sidenav y actualizar FAB al navegar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      withLatestFrom(this.isMobile$),
      takeUntil(this.destroy$)
    ).subscribe(([event, isMobile]) => {
      const navEnd = event as NavigationEnd;
      this.currentRoute = navEnd.urlAfterRedirects || navEnd.url;
      this.showFab = this.fabRoutes.some(r => this.currentRoute === r);

      if (isMobile) {
        this.sidenavAberto = false;
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidenav() {
    this.sidenavAberto = !this.sidenavAberto;
  }

  cerrarSidenav() {
    this.sidenavAberto = false;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // Obtener iniciales del usuario para avatar
  getInitials(nombre: string | undefined, apellido?: string): string {
    if (!nombre) return 'U';

    const nombreParts = nombre.trim().split(' ');
    if (nombreParts.length >= 2) {
      return (nombreParts[0][0] + nombreParts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
    this.cerrarSidenav();
  }

  abrirPerfil() {
    this.router.navigate(['/perfil']);
    this.cerrarSidenav();
  }

  abrirSettings() {
    this.router.navigate(['/settings']);
    this.cerrarSidenav();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('gastos_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('gastos_theme', 'light');
    }
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.url;
  }

  fabAction() {
    this.router.navigate(['/gastos/nuevo']);
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.cerrarSidenav();
  }
}
