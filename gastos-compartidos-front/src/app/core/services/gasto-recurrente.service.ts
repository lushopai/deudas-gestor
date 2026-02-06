import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Frecuencia = 'DIARIA' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

export interface GastoRecurrente {
  id: number;
  descripcion: string;
  monto: number;
  categoriaId: number;
  categoriaNombre: string;
  categoriaIcono: string;
  frecuencia: Frecuencia;
  frecuenciaDescripcion: string;
  diaEjecucion: number;
  fechaInicio: string;
  fechaFin?: string;
  proximaEjecucion: string;
  ultimaEjecucion?: string;
  activo: boolean;
  esCompartido: boolean;
  notas?: string;
  totalEjecutado: number;
  diasHastaProxima: number;
  fechaCreacion: string;
}

export interface GastoRecurrenteCreate {
  descripcion: string;
  monto: number;
  categoriaId: number;
  frecuencia: Frecuencia;
  diaEjecucion?: number;
  fechaInicio?: string;
  fechaFin?: string;
  esCompartido?: boolean;
  notas?: string;
}

export const FRECUENCIA_LABELS: Record<Frecuencia, string> = {
  DIARIA: 'Diario',
  SEMANAL: 'Semanal',
  QUINCENAL: 'Quincenal',
  MENSUAL: 'Mensual',
  BIMESTRAL: 'Bimestral',
  TRIMESTRAL: 'Trimestral',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual'
};

@Injectable({
  providedIn: 'root'
})
export class GastoRecurrenteService {
  private apiUrl = `${environment.apiUrl}/gastos-recurrentes`;

  constructor(private http: HttpClient) {}

  crear(data: GastoRecurrenteCreate): Observable<GastoRecurrente> {
    return this.http.post<GastoRecurrente>(this.apiUrl, data);
  }

  listar(soloActivos = false): Observable<GastoRecurrente[]> {
    const params = new HttpParams().set('soloActivos', soloActivos.toString());
    return this.http.get<GastoRecurrente[]>(this.apiUrl, { params });
  }

  obtener(id: number): Observable<GastoRecurrente> {
    return this.http.get<GastoRecurrente>(`${this.apiUrl}/${id}`);
  }

  proximos(dias = 7): Observable<GastoRecurrente[]> {
    const params = new HttpParams().set('dias', dias.toString());
    return this.http.get<GastoRecurrente[]>(`${this.apiUrl}/proximos`, { params });
  }

  actualizar(id: number, data: GastoRecurrenteCreate): Observable<GastoRecurrente> {
    return this.http.put<GastoRecurrente>(`${this.apiUrl}/${id}`, data);
  }

  toggleActivo(id: number): Observable<GastoRecurrente> {
    return this.http.patch<GastoRecurrente>(`${this.apiUrl}/${id}/toggle`, {});
  }

  ejecutarManualmente(id: number): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/${id}/ejecutar`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resumen(): Observable<{ activos: number }> {
    return this.http.get<{ activos: number }>(`${this.apiUrl}/resumen`);
  }
}
