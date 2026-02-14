import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { PageResponse } from '../models/page-response';
import { toObservable } from '@angular/core/rxjs-interop';

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  montoOriginal: number;
  notas?: string;
  rutaFoto?: string;
  usuarioId: number;
  parejaId: number;
  categoriaId?: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  icono: string;
  color?: string;
  activo: boolean;
}

export interface ResumenGastos {
  totalGastos: number;
  cantidadGastos: number;
  promedioPorGasto: number;
  gastosPorCategoria: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private apiUrl = `${environment.apiUrl}/gastos`;

  // Signals para el estado
  private _gastos = signal<Gasto[]>([]);
  private _cargando = signal(false);
  private _error = signal<string | null>(null);

  // Signals públicos readonly
  gastos = this._gastos.asReadonly();
  cargando = this._cargando.asReadonly();
  error = this._error.asReadonly();

  // Computed signals
  totalGastos = computed(() =>
    this._gastos().reduce((sum, g) => sum + g.monto, 0)
  );

  cantidadGastos = computed(() => this._gastos().length);

  // Observable para compatibilidad con componentes que aún no migran
  gastos$ = toObservable(this._gastos);

  constructor(private http: HttpClient) {}

  // Obtener gastos paginados
  obtenerGastosPaginado(page = 0, size = 20): Observable<PageResponse<Gasto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Gasto>>(this.apiUrl, { params });
  }

  // Obtener todos los gastos (extrae content de la respuesta paginada)
  obtenerGastos(): Observable<Gasto[]> {
    this._cargando.set(true);
    this._error.set(null);
    return this.http.get<PageResponse<Gasto>>(this.apiUrl, {
      params: new HttpParams().set('size', '1000')
    }).pipe(
      map(page => page.content),
      tap({
        next: gastos => {
          this._gastos.set(gastos);
          this._cargando.set(false);
        },
        error: () => {
          this._error.set('Error al cargar gastos');
          this._cargando.set(false);
        }
      })
    );
  }

  // Obtener gastos recientes (últimos N)
  obtenerGastosRecientes(cantidad: number = 5): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`${this.apiUrl}/recientes?cantidad=${cantidad}`);
  }

  // Obtener resumen de gastos
  obtenerResumenGastos(): Observable<ResumenGastos> {
    return this.http.get<ResumenGastos>(`${this.apiUrl}/resumen`);
  }

  // Obtener un gasto por ID
  obtenerGastoPorId(id: number): Observable<Gasto> {
    return this.http.get<Gasto>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo gasto
  crearGasto(gasto: Partial<Gasto>): Observable<Gasto> {
    return this.http.post<Gasto>(`${this.apiUrl}`, gasto).pipe(
      tap(nuevoGasto => {
        // Optimistic update: agregar el nuevo gasto al estado actual usando signals
        this._gastos.update(gastos => [...gastos, nuevoGasto]);
        this._error.set(null);
      })
    );
  }

  // Actualizar gasto
  actualizarGasto(id: number, gasto: Partial<Gasto>): Observable<Gasto> {
    return this.http.put<Gasto>(`${this.apiUrl}/${id}`, gasto).pipe(
      tap(gastoActualizado => {
        // Optimistic update: reemplazar el gasto en el estado actual usando signals
        this._gastos.update(gastos =>
          gastos.map(g => (g.id === id ? gastoActualizado : g))
        );
        this._error.set(null);
      })
    );
  }

  // Eliminar gasto
  eliminarGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Optimistic update: eliminar el gasto del estado actual usando signals
        this._gastos.update(gastos => gastos.filter(g => g.id !== id));
        this._error.set(null);
      })
    );
  }

  // Obtener categorías
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${environment.apiUrl}/public/categorias`);
  }

  // Obtener gastos por rango de fechas
  obtenerGastosPorFecha(fechaInicio: string, fechaFin: string): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(
      `${this.apiUrl}/rango?inicio=${fechaInicio}&fin=${fechaFin}`
    );
  }

  // Obtener gastos por categoría
  obtenerGastosPorCategoria(categoriaId: number): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }
}
