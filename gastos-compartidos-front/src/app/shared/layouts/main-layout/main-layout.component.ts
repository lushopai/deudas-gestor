import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { DefaultAvatarPipe } from '../../pipes/default-avatar.pipe';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    DefaultAvatarPipe
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  sidenavAberto = false;
  usuario$;

  menuItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard_outlined',
      route: '/dashboard'
    },
    {
      label: 'Nuevo Gasto',
      icon: 'add_circle_outline',
      route: '/gastos/nuevo'
    },
    {
      label: 'Escanear Recibo',
      icon: 'receipt_long',
      route: '/gastos/ocr'
    },
    {
      label: 'Ver Gastos',
      icon: 'list_alt',
      route: '/gastos'
    },
    {
      label: 'Abonar Pago',
      icon: 'payment',
      route: '/deudas/abonar'
    },
    {
      label: 'Historial Pagos',
      icon: 'history',
      route: '/deudas/historial'
    },
    {
      label: 'Reportes',
      icon: 'assessment',
      route: '/reportes'
    }
  ];

  isMobile$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.usuario$ = this.authService.usuario$;
    // Usa un breakpoint manual más amplio para asegurar que tablets/móviles grandes se traten como móvil
    this.isMobile$ = this.breakpointObserver.observe('(max-width: 960px)')
      .pipe(map(result => result.matches));
  }

  ngOnInit() {
    // Cerrar sidenav automáticamente en móvil al navegar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMobile$.subscribe(isMobile => {
        if (isMobile) {
          this.sidenavAberto = false;
        }
      });
    });
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

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.cerrarSidenav();
  }
}
