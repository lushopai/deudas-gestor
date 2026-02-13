import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  GastoRecurrenteService,
  GastoRecurrente,
  FRECUENCIA_LABELS
} from '../../../core/services/gasto-recurrente.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-recurrentes-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatSlideToggleModule,
    EmptyStateComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './recurrentes-list.html',
  styleUrl: './recurrentes-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecurrentesList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  gastos: GastoRecurrente[] = [];
  cargando = true;
  filtroActivo = 'todos'; // 'todos' | 'activos' | 'inactivos'

  frecuenciaLabels = FRECUENCIA_LABELS;

  constructor(
    private gastoRecurrenteService: GastoRecurrenteService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.gastoRecurrenteService.listar().pipe(takeUntil(this.destroy$)).subscribe({
      next: (gastos) => {
        this.gastos = gastos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get gastosFiltrados(): GastoRecurrente[] {
    switch (this.filtroActivo) {
      case 'activos':
        return this.gastos.filter(g => g.activo);
      case 'inactivos':
        return this.gastos.filter(g => !g.activo);
      default:
        return this.gastos;
    }
  }

  get totalMensual(): number {
    return this.gastos
      .filter(g => g.activo)
      .reduce((sum, g) => {
        switch (g.frecuencia) {
          case 'DIARIA': return sum + g.monto * 30;
          case 'SEMANAL': return sum + g.monto * 4;
          case 'QUINCENAL': return sum + g.monto * 2;
          case 'MENSUAL': return sum + g.monto;
          case 'BIMESTRAL': return sum + g.monto / 2;
          case 'TRIMESTRAL': return sum + g.monto / 3;
          case 'SEMESTRAL': return sum + g.monto / 6;
          case 'ANUAL': return sum + g.monto / 12;
          default: return sum + g.monto;
        }
      }, 0);
  }

  get cantidadActivos(): number {
    return this.gastos.filter(g => g.activo).length;
  }

  cambiarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
  }

  nuevoGasto(): void {
    this.router.navigate(['/gastos-recurrentes/nuevo']);
  }

  editarGasto(gasto: GastoRecurrente): void {
    this.router.navigate(['/gastos-recurrentes', gasto.id, 'editar']);
  }

  toggleActivo(gasto: GastoRecurrente): void {
    this.gastoRecurrenteService.toggleActivo(gasto.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        const idx = this.gastos.findIndex(g => g.id === gasto.id);
        if (idx !== -1) this.gastos[idx] = updated;
        this.notificationService.success(
          updated.activo ? 'Gasto recurrente activado' : 'Gasto recurrente desactivado'
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Error al cambiar estado');
      }
    });
  }

  ejecutarManualmente(gasto: GastoRecurrente): void {
    this.gastoRecurrenteService.ejecutarManualmente(gasto.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Gasto generado exitosamente');
        this.cargarDatos();
      },
      error: () => {
        this.notificationService.error('Error al generar el gasto');
      }
    });
  }

  async eliminarGasto(gasto: GastoRecurrente): Promise<void> {
    const confirmado = await this.notificationService.confirm(
      `Se eliminará "${gasto.descripcion}". Esta acción no se puede deshacer.`,
      '¿Eliminar gasto recurrente?'
    );

    if (confirmado) {
      this.gastoRecurrenteService.eliminar(gasto.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.notificationService.success('Gasto recurrente eliminado');
          this.cargarDatos();
        },
        error: () => {
          this.notificationService.error('Error al eliminar');
        }
      });
    }
  }

  getIconoFrecuencia(frecuencia: string): string {
    switch (frecuencia) {
      case 'DIARIA': return 'today';
      case 'SEMANAL': return 'date_range';
      case 'QUINCENAL': return 'event';
      case 'MENSUAL': return 'calendar_month';
      case 'BIMESTRAL':
      case 'TRIMESTRAL': return 'calendar_today';
      case 'SEMESTRAL':
      case 'ANUAL': return 'event_note';
      default: return 'schedule';
    }
  }

  getEstadoTexto(gasto: GastoRecurrente): string {
    if (!gasto.activo) return 'Pausado';
    if (gasto.diasHastaProxima <= 0) return 'Pendiente';
    if (gasto.diasHastaProxima === 1) return 'Mañana';
    if (gasto.diasHastaProxima <= 3) return `En ${gasto.diasHastaProxima} días`;
    return gasto.frecuenciaDescripcion;
  }

  getColorEstado(gasto: GastoRecurrente): string {
    if (!gasto.activo) return 'inactivo';
    if (gasto.diasHastaProxima <= 0) return 'pendiente';
    if (gasto.diasHastaProxima <= 3) return 'proximo';
    return 'normal';
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(monto);
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CL');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
