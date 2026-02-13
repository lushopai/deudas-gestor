import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap, map } from 'rxjs/operators';
import { PageResponse } from '../models/page-response';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  fotoPerfil?: string;
}

export interface PagoCreate {
  receptorId: number;
  monto: number;
  concepto?: string;
  metodoPago: MetodoPago;
  fechaPago?: string;
}

export interface Pago {
  id: number;
  pagador: Usuario;
  receptor: Usuario;
  monto: number;
  concepto?: string;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  fechaPago: string;
  fechaCreacion: string;
  mesPago: number;
  anoPago: number;
}

export interface ResumenDeuda {
  parejaId: number;
  usuario1: Usuario;
  usuario2: Usuario;
  totalGastosUsuario1: number;
  totalGastosUsuario2: number;
  totalPagosUsuario1: number;
  totalPagosUsuario2: number;
  totalAbonosUsuario1AUsuario2: number;
  totalAbonosUsuario2AUsuario1: number;
  deudor?: Usuario;
  acreedor?: Usuario;
  saldoPendiente: number;
  ultimoPago?: string;
  historialReciente: Pago[];
  mensajeBalance: string;
}

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  TARJETA = 'TARJETA',
  OTRO = 'OTRO'
}

export enum EstadoPago {
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = `${environment.apiUrl}/pagos`;
  private resumenDeudaSubject = new BehaviorSubject<ResumenDeuda | null>(null);
  public resumenDeuda$ = this.resumenDeudaSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Registrar un nuevo pago
  registrarPago(pago: PagoCreate): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pago).pipe(
      tap(() => this.refrescarResumenDeuda())
    );
  }

  // Obtener historial de pagos paginado
  obtenerHistorialPaginado(page = 0, size = 20): Observable<PageResponse<Pago>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Pago>>(this.apiUrl, { params });
  }

  // Obtener historial de pagos (backward compatible)
  obtenerHistorial(): Observable<Pago[]> {
    return this.http.get<PageResponse<Pago>>(this.apiUrl, {
      params: new HttpParams().set('size', '1000')
    }).pipe(
      map(page => page.content)
    );
  }

  // Obtener un pago por ID
  obtenerPagoPorId(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  // Cancelar un pago
  cancelarPago(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refrescarResumenDeuda())
    );
  }

  // Obtener resumen de deuda
  obtenerResumenDeuda(): Observable<ResumenDeuda> {
    return this.http.get<ResumenDeuda>(`${this.apiUrl}/resumen`).pipe(
      tap(resumen => this.resumenDeudaSubject.next(resumen))
    );
  }

  // Refrescar resumen de deuda
  private refrescarResumenDeuda(): void {
    this.obtenerResumenDeuda().subscribe();
  }

  // Limpiar estado
  limpiarEstado(): void {
    this.resumenDeudaSubject.next(null);
  }
}
