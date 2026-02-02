import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

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
  private gastosSubject = new BehaviorSubject<Gasto[]>([]);
  public gastos$ = this.gastosSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Obtener todos los gastos del usuario
  obtenerGastos(): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`${this.apiUrl}`).pipe(
      tap(gastos => this.gastosSubject.next(gastos))
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
      tap(() => this.obtenerGastos().subscribe())
    );
  }

  // Actualizar gasto
  actualizarGasto(id: number, gasto: Partial<Gasto>): Observable<Gasto> {
    return this.http.put<Gasto>(`${this.apiUrl}/${id}`, gasto).pipe(
      tap(() => this.obtenerGastos().subscribe())
    );
  }

  // Eliminar gasto
  eliminarGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.obtenerGastos().subscribe())
    );
  }

  // Obtener categorías
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${environment.apiUrl}/categorias`);
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
