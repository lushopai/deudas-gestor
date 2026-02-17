import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Auth
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  registro(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro`, data);
  }

  loginConGoogle(tokenGoogle: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google-login`, { token: tokenGoogle });
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refresh`, { refreshToken });
  }

  // Categorías
  getCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/public/categorias`);
  }

  // Gastos
  crearGasto(gasto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/gastos`, gasto);
  }

  getGasto(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/gastos/${id}`);
  }

  actualizarGasto(id: number, gasto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/gastos/${id}`, gasto);
  }

  getGastosPorPareja(parejaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/gastos/pareja/${parejaId}`);
  }

  // Usuarios
  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/me`);
  }

  actualizarPerfil(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/me`, datos);
  }

  cambiarPassword(datos: { passwordActual: string, passwordNueva: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/me/password`, datos);
  }

  // Reportes
  getReporteMensual(mes: number, anio: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/mes`, {
      params: { ano: anio.toString(), mes: mes.toString() }
    });
  }

  exportarPdf(desde: string, hasta: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reportes/exportar/pdf`, {
      params: { desde, hasta },
      responseType: 'blob'
    });
  }

  exportarExcel(desde: string, hasta: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reportes/exportar/excel`, {
      params: { desde, hasta },
      responseType: 'blob'
    });
  }
}
