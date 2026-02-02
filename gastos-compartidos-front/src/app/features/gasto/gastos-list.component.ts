import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { GastoService, Gasto } from '../../core/services/gasto.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-gastos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './gastos-list.component.html',
  styleUrls: ['./gastos-list.component.scss']
})
export class GastosListComponent implements OnInit {
  gastos: Gasto[] = [];
  cargando = true;
  error: string | null = null;
  displayedColumns: string[] = ['descripcion', 'monto', 'categoria', 'fecha', 'acciones'];

  constructor(
    private gastoService: GastoService,
    private alertService: AlertService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarGastos();
  }

  cargarGastos() {
    this.cargando = true;
    this.error = null;

    this.gastoService.obtenerGastos().subscribe({
      next: (gastos) => {
        this.gastos = gastos;
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar gastos:', err);
        this.error = 'No se pudieron cargar los gastos';
        this.alertService.error(
          'No se pudieron cargar los gastos',
          'Error de conexión',
          err.message || 'Verifica tu conexión e intenta nuevamente'
        );
        this.cargando = false;
        this.cdRef.detectChanges();
      }
    });
  }

  eliminarGasto(id: number) {
    this.alertService.confirm(
      'Esta acción no se puede deshacer',
      '¿Eliminar este gasto?'
    ).then((result) => {
      if (result.isConfirmed) {
        this.alertService.loading('Eliminando gasto...');

        this.gastoService.eliminarGasto(id).subscribe({
          next: () => {
            this.alertService.close();
            this.alertService.success('El gasto se eliminó correctamente');
            this.cargarGastos();
          },
          error: (err) => {
            this.alertService.close();
            console.error('Error al eliminar gasto:', err);
            this.alertService.error(
              'No se pudo eliminar el gasto',
              'Error',
              err.error?.message || 'Intenta nuevamente'
            );
          }
        });
      }
    });
  }

  editarGasto(id: number) {
    this.router.navigate(['/gastos/editar', id]);
  }

  reintentar() {
    this.cargarGastos();
  }
}
