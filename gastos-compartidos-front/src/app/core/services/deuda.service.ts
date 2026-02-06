import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TipoDeuda =
  | 'TARJETA_CREDITO'
  | 'PRESTAMO_PERSONAL'
  | 'PRESTAMO_HIPOTECARIO'
  | 'PRESTAMO_VEHICULAR'
  | 'DEUDA_FAMILIAR'
  | 'DEUDA_AMIGO'
  | 'SERVICIO'
  | 'OTRO';

export type EstadoDeuda = 'ACTIVA' | 'PAGADA' | 'VENCIDA' | 'CANCELADA';

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'OTRO';

export interface Deuda {
  id: number;
  acreedor: string;
  descripcion?: string;
  tipo: TipoDeuda;
  montoOriginal: number;
  saldoPendiente: number;
  montoPagado: number;
  estado: EstadoDeuda;
  fechaInicio?: string;
  fechaVencimiento?: string;
  diaCorte?: number;
  diaLimitePago?: number;
  tasaInteres?: number;
  progreso: number;
  totalAbonos: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  ultimosAbonos?: AbonoDeuda[];
}

export interface DeudaCreate {
  acreedor: string;
  descripcion?: string;
  tipo: TipoDeuda;
  montoOriginal: number;
  fechaInicio?: string;
  fechaVencimiento?: string;
  diaCorte?: number;
  diaLimitePago?: number;
  tasaInteres?: number;
}

export interface AbonoDeuda {
  id: number;
  deudaId: number;
  deudaAcreedor: string;
  monto: number;
  fechaPago: string;
  metodoPago: MetodoPago;
  comprobante?: string;
  notas?: string;
  fechaCreacion: string;
}

export interface AbonoDeudaCreate {
  monto: number;
  fechaPago?: string;
  metodoPago?: MetodoPago;
  comprobante?: string;
  notas?: string;
}

export interface ResumenDeudas {
  totalDeudaPendiente: number;
  cantidadDeudasActivas: number;
  totalAbonadoEsteMes: number;
  ultimosAbonos: AbonoDeuda[];
}

// Labels para mostrar en UI
export const TIPO_DEUDA_LABELS: Record<TipoDeuda, string> = {
  TARJETA_CREDITO: 'Tarjeta de Crédito',
  PRESTAMO_PERSONAL: 'Préstamo Personal',
  PRESTAMO_HIPOTECARIO: 'Préstamo Hipotecario',
  PRESTAMO_VEHICULAR: 'Préstamo Vehicular',
  DEUDA_FAMILIAR: 'Deuda Familiar',
  DEUDA_AMIGO: 'Deuda con Amigo',
  SERVICIO: 'Servicio',
  OTRO: 'Otro'
};

export const ESTADO_DEUDA_LABELS: Record<EstadoDeuda, string> = {
  ACTIVA: 'Activa',
  PAGADA: 'Pagada',
  VENCIDA: 'Vencida',
  CANCELADA: 'Cancelada'
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  OTRO: 'Otro'
};

@Injectable({
  providedIn: 'root'
})
export class DeudaService {
  private apiUrl = `${environment.apiUrl}/deudas`;

  constructor(private http: HttpClient) {}

  // ==================== DEUDAS ====================

  crearDeuda(deuda: DeudaCreate): Observable<Deuda> {
    return this.http.post<Deuda>(this.apiUrl, deuda);
  }

  obtenerDeudas(soloActivas = false): Observable<Deuda[]> {
    const params = new HttpParams().set('soloActivas', soloActivas.toString());
    return this.http.get<Deuda[]>(this.apiUrl, { params });
  }

  obtenerDeuda(id: number): Observable<Deuda> {
    return this.http.get<Deuda>(`${this.apiUrl}/${id}`);
  }

  actualizarDeuda(id: number, deuda: DeudaCreate): Observable<Deuda> {
    return this.http.put<Deuda>(`${this.apiUrl}/${id}`, deuda);
  }

  eliminarDeuda(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cancelarDeuda(id: number): Observable<Deuda> {
    return this.http.post<Deuda>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  // ==================== ABONOS ====================

  registrarAbono(deudaId: number, abono: AbonoDeudaCreate): Observable<AbonoDeuda> {
    return this.http.post<AbonoDeuda>(`${this.apiUrl}/${deudaId}/abonos`, abono);
  }

  obtenerAbonos(deudaId: number): Observable<AbonoDeuda[]> {
    return this.http.get<AbonoDeuda[]>(`${this.apiUrl}/${deudaId}/abonos`);
  }

  eliminarAbono(deudaId: number, abonoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${deudaId}/abonos/${abonoId}`);
  }

  // ==================== RESUMEN ====================

  obtenerResumen(): Observable<ResumenDeudas> {
    return this.http.get<ResumenDeudas>(`${this.apiUrl}/resumen`);
  }
}
