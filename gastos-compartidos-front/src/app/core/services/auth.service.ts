import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'gastos_token';
  private usuarioKey = 'gastos_usuario';

  // Signal privado para el estado del usuario
  private _usuario = signal<any>(this.getUsuarioDelLocalStorage());

  // Signal público readonly
  usuario = this._usuario.asReadonly();

  // Observable para compatibilidad con componentes que aún no migran
  usuario$ = toObservable(this._usuario);

  // Computed signal para saber si está autenticado
  estaAutenticadoSignal = computed(() => {
    const token = this.obtenerToken();
    if (!token) return false;
    if (this.tokenExpirado(token)) return false;
    return this._usuario() !== null;
  });

  constructor(private apiService: ApiService) {}

  login(email: string, password: string): Observable<any> {
    return this.apiService.login(email, password).pipe(
      tap(response => {
        this.guardarToken(response.token);
        this.guardarUsuario(response.usuario);
        this._usuario.set(response.usuario);
      })
    );
  }

  registro(data: any): Observable<any> {
    return this.apiService.registro(data).pipe(
      tap(response => {
        this.guardarToken(response.token);
        this.guardarUsuario(response.usuario);
        this._usuario.set(response.usuario);
      })
    );
  }

  loginConGoogle(tokenGoogle: string): Observable<any> {
    return this.apiService.loginConGoogle(tokenGoogle).pipe(
      tap(response => {
        this.guardarToken(response.token);
        this.guardarUsuario(response.usuario);
        this._usuario.set(response.usuario);
      })
    );
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica si el usuario está autenticado y si el token no ha expirado
   */
  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;

    // Verificar si el token ha expirado
    if (this.tokenExpirado(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usuarioKey);
    this._usuario.set(null);
  }

  obtenerUsuario(): any {
    return this._usuario();
  }

  /**
   * Decodifica el payload del JWT y verifica si ha expirado
   */
  private tokenExpirado(token: string): boolean {
    try {
      const payload = this.decodificarToken(token);
      if (!payload || !payload.exp) return true;

      // exp está en segundos, Date.now() en milisegundos
      const expiracion = payload.exp * 1000;
      return Date.now() >= expiracion;
    } catch {
      return true;
    }
  }

  /**
   * Decodifica el payload de un JWT sin verificar la firma
   */
  private decodificarToken(token: string): any {
    try {
      const partes = token.split('.');
      if (partes.length !== 3) return null;

      const payload = partes[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  private guardarToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private guardarUsuario(usuario: any): void {
    localStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
  }

  private getUsuarioDelLocalStorage(): any {
    const usuario = localStorage.getItem(this.usuarioKey);
    return usuario ? JSON.parse(usuario) : null;
  }
}
