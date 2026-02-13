import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Presupuesto {
    id: number;
    categoriaId: number | null;
    categoriaNombre: string;
    categoriaIcono: string;
    limite: number;
    gastado: number;
    disponible: number;
    porcentajeUsado: number;
    periodo: 'SEMANAL' | 'MENSUAL' | 'ANUAL';
    activo: boolean;
    notas: string | null;
    estado: 'OK' | 'ALERTA' | 'EXCEDIDO';
}

export interface PresupuestoCreate {
    categoriaId?: number;
    limite: number;
    periodo: 'SEMANAL' | 'MENSUAL' | 'ANUAL';
    notas?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PresupuestoService {
    private readonly apiUrl = `${environment.apiUrl}/presupuestos`;

    constructor(private http: HttpClient) { }

    listar(): Observable<Presupuesto[]> {
        return this.http.get<Presupuesto[]>(this.apiUrl);
    }

    listarActivos(): Observable<Presupuesto[]> {
        return this.http.get<Presupuesto[]>(`${this.apiUrl}/activos`);
    }

    crear(data: PresupuestoCreate): Observable<Presupuesto> {
        return this.http.post<Presupuesto>(this.apiUrl, data);
    }

    actualizar(id: number, data: PresupuestoCreate): Observable<Presupuesto> {
        return this.http.put<Presupuesto>(`${this.apiUrl}/${id}`, data);
    }

    toggleActivo(id: number): Observable<Presupuesto> {
        return this.http.patch<Presupuesto>(`${this.apiUrl}/${id}/toggle`, {});
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
