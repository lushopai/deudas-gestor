import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';
import { GastoService, Gasto, ResumenGastos } from '../../core/services/gasto.service';
import { BalanceCard } from '../deudas/balance-card/balance-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    BalanceCard
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  gastosRecientes: Gasto[] = [];
  resumenGastos: ResumenGastos | null = null;
  cargando = true;
  error: string | null = null;
  Object = Object;  // Hacer Object accesible en el template

  constructor(
    public authService: AuthService,
    private gastoService: GastoService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.error = null;

    forkJoin({
      recent: this.gastoService.obtenerGastosRecientes(5),
      summary: this.gastoService.obtenerResumenGastos()
    }).subscribe({
      next: ({ recent, summary }) => {
        this.gastosRecientes = recent;
        this.resumenGastos = summary;
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.error = 'No se pudieron cargar los datos. Por favor, intenta de nuevo.';
        this.cargando = false;
        this.cdRef.detectChanges();
      }
    });
  }

  obtenerPorcentaje(monto: number, total: number): number {
    return total > 0 ? Math.round((monto / total) * 100) : 0;
  }

  abrirNuevoGasto() {
    this.router.navigate(['/gastos/nuevo']);
  }

  abrirOCR() {
    this.router.navigate(['/gastos/ocr']);
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  reintentar() {
    this.cargarDatos();
  }
}
