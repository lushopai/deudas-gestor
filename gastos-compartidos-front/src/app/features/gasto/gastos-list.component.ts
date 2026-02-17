import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { GastoService, Gasto, Categoria } from '../../core/services/gasto.service';
import { PageResponse } from '../../core/models/page-response';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader';
import { PullToRefreshDirective } from '../../shared/directives/pull-to-refresh.directive';
import { ClpPipe } from '../../shared/pipes/clp.pipe';

@Component({
  selector: 'app-gastos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
    PullToRefreshDirective,
    ClpPipe
  ],
  templateUrl: './gastos-list.component.html',
  styleUrls: ['./gastos-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GastosListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  gastos: Gasto[] = [];
  gastosFiltrados: Gasto[] = [];
  categorias: Categoria[] = [];
  cargando = true;
  cargandoMas = false;
  error: string | null = null;
  displayedColumns: string[] = ['descripcion', 'monto', 'categoria', 'fecha', 'acciones'];

  // Paginación
  paginaActual = 0;
  totalPaginas = 0;
  totalElementos = 0;
  pageSize = 20;
  esUltimaPagina = false;

  // Filtros
  busqueda = '';
  categoriaSeleccionada: number | null = null;
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;
  filtrosVisibles = false;

  constructor(
    private gastoService: GastoService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarGastos();
    this.gastoService.obtenerCategorias().pipe(takeUntil(this.destroy$)).subscribe({
      next: (cats) => this.categorias = cats.filter(c => c.activo),
      error: () => { }
    });

    // Abrir filtros si se navega con ?buscar=true
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['buscar'] === 'true') {
        this.filtrosVisibles = true;
        this.cdRef.detectChanges();
        // Limpiar el query param
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  cargarGastos() {
    this.cargando = true;
    this.error = null;
    this.paginaActual = 0;
    this.gastos = [];

    this.gastoService.obtenerGastosPaginado(0, this.pageSize).pipe(takeUntil(this.destroy$)).subscribe({
      next: (page: PageResponse<Gasto>) => {
        this.gastos = page.content;
        this.totalPaginas = page.page.totalPages;
        this.totalElementos = page.page.totalElements;
        this.esUltimaPagina = page.page.number >= page.page.totalPages - 1;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar gastos:', err);
        this.error = 'No se pudieron cargar los gastos';
        this.notificationService.error(
          'No se pudieron cargar los gastos',
          'Error de conexión',
          err.message || 'Verifica tu conexión e intenta nuevamente'
        );
        this.cargando = false;
        this.cdRef.detectChanges();
      }
    });
  }

  cargarMas() {
    if (this.esUltimaPagina || this.cargandoMas) return;
    this.cargandoMas = true;
    this.paginaActual++;

    this.gastoService.obtenerGastosPaginado(this.paginaActual, this.pageSize).pipe(takeUntil(this.destroy$)).subscribe({
      next: (page: PageResponse<Gasto>) => {
        this.gastos = [...this.gastos, ...page.content];
        this.esUltimaPagina = page.page.number >= page.page.totalPages - 1;
        this.aplicarFiltros();
        this.cargandoMas = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.paginaActual--;
        this.cargandoMas = false;
        this.cdRef.detectChanges();
      }
    });
  }

  aplicarFiltros() {
    let resultado = [...this.gastos];

    // Filtrar por búsqueda de texto
    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();
      resultado = resultado.filter(g =>
        g.descripcion.toLowerCase().includes(termino) ||
        (g.notas && g.notas.toLowerCase().includes(termino))
      );
    }

    // Filtrar por categoría
    if (this.categoriaSeleccionada !== null) {
      resultado = resultado.filter(g => g.categoriaId === this.categoriaSeleccionada);
    }

    // Filtrar por rango de fechas
    if (this.fechaDesde) {
      const desde = new Date(this.fechaDesde);
      desde.setHours(0, 0, 0, 0);
      resultado = resultado.filter(g => new Date(g.fechaCreacion) >= desde);
    }
    if (this.fechaHasta) {
      const hasta = new Date(this.fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      resultado = resultado.filter(g => new Date(g.fechaCreacion) <= hasta);
    }

    this.gastosFiltrados = resultado;
  }

  filtrarPorCategoria(catId: number | null) {
    this.categoriaSeleccionada = catId;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.categoriaSeleccionada = null;
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.aplicarFiltros();
  }

  get hayFiltrosActivos(): boolean {
    return this.busqueda.trim() !== '' ||
      this.categoriaSeleccionada !== null ||
      this.fechaDesde !== null ||
      this.fechaHasta !== null;
  }

  getNombreCategoria(catId: number | undefined): string {
    if (!catId) return 'Sin categoría';
    const cat = this.categorias.find(c => c.id === catId);
    return cat ? `${cat.icono} ${cat.nombre}` : `Categoría ${catId}`;
  }

  getIconoCategoria(catId: number | undefined): string {
    if (!catId) return '📦';
    const cat = this.categorias.find(c => c.id === catId);
    return cat?.icono || '📦';
  }

  getSoloNombreCategoria(catId: number | undefined): string {
    if (!catId) return 'Sin categoría';
    const cat = this.categorias.find(c => c.id === catId);
    return cat?.nombre || `Categoría ${catId}`;
  }

  async eliminarGasto(id: number) {
    const confirmed = await this.notificationService.confirm(
      'Esta acción no se puede deshacer',
      '¿Eliminar este gasto?'
    );
    if (confirmed) {
      this.notificationService.showLoading('Eliminando gasto...');

      this.gastoService.eliminarGasto(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.notificationService.closeLoading();
          this.notificationService.success('El gasto se eliminó correctamente');
          this.cargarGastos();
        },
        error: (err) => {
          this.notificationService.closeLoading();
          console.error('Error al eliminar gasto:', err);
          this.notificationService.error(
            'No se pudo eliminar el gasto',
            'Error',
            err.error?.message || 'Intenta nuevamente'
          );
        }
      });
    }
  }

  editarGasto(id: number) {
    this.router.navigate(['/gastos/editar', id]);
  }

  crearGasto() {
    this.router.navigate(['/gastos/nuevo']);
  }

  reintentar() {
    this.cargarGastos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
