import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import {
  DeudaService,
  Deuda,
  ResumenDeudas,
  TIPO_DEUDA_LABELS,
  ESTADO_DEUDA_LABELS
} from '../../../core/services/deuda.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-deudas-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule,
    MatTabsModule,
    EmptyStateComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './deudas-list.html',
  styleUrl: './deudas-list.scss'
})
export class DeudasList implements OnInit {
  deudas: Deuda[] = [];
  resumen: ResumenDeudas | null = null;
  cargando = true;
  filtroActivo = 'todas'; // 'todas' | 'activas' | 'pagadas'

  tipoDeudaLabels = TIPO_DEUDA_LABELS;
  estadoDeudaLabels = ESTADO_DEUDA_LABELS;

  constructor(
    private deudaService: DeudaService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    // Cargar deudas y resumen en paralelo
    this.deudaService.obtenerDeudas().subscribe({
      next: (deudas) => {
        this.deudas = deudas;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    this.deudaService.obtenerResumen().subscribe({
      next: (resumen) => {
        this.resumen = resumen;
        this.cdr.detectChanges();
      }
    });
  }

  get deudasFiltradas(): Deuda[] {
    switch (this.filtroActivo) {
      case 'activas':
        return this.deudas.filter(d => d.estado === 'ACTIVA');
      case 'pagadas':
        return this.deudas.filter(d => d.estado === 'PAGADA');
      default:
        return this.deudas;
    }
  }

  cambiarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
  }

  nuevaDeuda(): void {
    this.router.navigate(['/deudas-externas/nueva']);
  }

  verDetalle(deuda: Deuda): void {
    this.router.navigate(['/deudas-externas', deuda.id]);
  }

  editarDeuda(deuda: Deuda): void {
    this.router.navigate(['/deudas-externas', deuda.id, 'editar']);
  }

  abonar(deuda: Deuda): void {
    this.router.navigate(['/deudas-externas', deuda.id, 'abonar']);
  }

  async eliminarDeuda(deuda: Deuda): Promise<void> {
    const confirmado = await this.notificationService.confirm(
      `Se eliminará "${deuda.acreedor}" y todos sus abonos. Esta acción no se puede deshacer.`,
      '¿Eliminar deuda?'
    );

    if (confirmado) {
      this.deudaService.eliminarDeuda(deuda.id).subscribe({
        next: () => {
          this.notificationService.success('Deuda eliminada');
          this.cargarDatos();
        },
        error: () => {
          this.notificationService.error('Error al eliminar la deuda');
        }
      });
    }
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'ACTIVA': return 'primary';
      case 'PAGADA': return 'accent';
      case 'VENCIDA': return 'warn';
      default: return '';
    }
  }

  getIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'TARJETA_CREDITO': return 'credit_card';
      case 'PRESTAMO_PERSONAL': return 'account_balance';
      case 'PRESTAMO_HIPOTECARIO': return 'home';
      case 'PRESTAMO_VEHICULAR': return 'directions_car';
      case 'DEUDA_FAMILIAR': return 'family_restroom';
      case 'DEUDA_AMIGO': return 'person';
      case 'SERVICIO': return 'receipt';
      default: return 'payments';
    }
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  }
}
