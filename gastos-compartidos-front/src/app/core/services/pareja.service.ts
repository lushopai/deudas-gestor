import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Pareja {
  id: number;
  nombrePareja: string;
  codigoInvitacion: string;
  cantidadMiembros: number;
  usuarios?: ParejaUsuario[];
  fechaCreacion: string;
}

export interface ParejaUsuario {
  id: number;
  nombre: string;
  email: string;
  fotoPerfil?: string;
}

export interface UnirParejaRequest {
  codigoInvitacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParejaService {
  private apiUrl = `${environment.apiUrl}/parejas`;

  constructor(private http: HttpClient) {}

  // Obtener mi pareja
  obtenerMiPareja(): Observable<Pareja> {
    return this.http.get<Pareja>(`${this.apiUrl}/mi-pareja`);
  }

  // Obtener código de invitación
  obtenerCodigoInvitacion(): Observable<string> {
    return this.http.get(`${this.apiUrl}/codigo-invitacion`, { responseType: 'text' });
  }

  // Unirse a una pareja con código
  unirseAPareja(codigoInvitacion: string): Observable<Pareja> {
    return this.http.post<Pareja>(`${this.apiUrl}/unirse`, { codigoInvitacion });
  }
}
