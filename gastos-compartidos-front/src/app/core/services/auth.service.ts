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
  private refreshTokenKey = 'gastos_refresh_token';
  private usuarioKey = 'gastos_usuario';

  private _usuario = signal<any>(this.getUsuarioDelLocalStorage());

  usuario = this._usuario.asReadonly();
  usuario$ = toObservable(this._usuario);

  estaAutenticadoSignal = computed(() => {
    const token = this.obtenerToken();
    if (!token) return false;
    if (this.tokenExpirado(token)) return false;
    return this._usuario() !== null;
  });

  constructor(private apiService: ApiService) { }

  login(email: string, password: string): Observable<any> {
    return this.apiService.login(email, password).pipe(
      tap(response => {
        this.guardarTokens(response.token, response.refreshToken);
        this.guardarUsuario(response.usuario);
        this._usuario.set(response.usuario);
      })
    );
  }

  registro(data: any): Observable<any> {
    return this.apiService.registro(data).pipe(
      tap(response => {
        this.guardarTokens(response.token, response.refreshToken);
        this.guardarUsuario(response.usuario);
        this._usuario.set(response.usuario);
      })
    );
  }

  loginConGoogle(tokenGoogle: string): Observable<any> {
    return this.apiService.loginConGoogle(tokenGoogle).pipe(
      tap(response => {
        this.guardarTokens(response.token, response.refreshToken);
        this.guardarUsuario(response.usuario);
        this._usuario.set(response.usuario);
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.obtenerRefreshToken();
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }
    return this.apiService.refreshToken(refreshToken).pipe(
      tap(response => {
        this.guardarTokens(response.token, response.refreshToken);
        if (response.usuario) {
          this.guardarUsuario(response.usuario);
          this._usuario.set(response.usuario);
        }
      })
    );
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  obtenerRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Verifica si el access token ha expirado pero el refresh token aún es válido
   */
  puedeRefrescar(): boolean {
    const refreshToken = this.obtenerRefreshToken();
    if (!refreshToken) return false;
    return !this.tokenExpirado(refreshToken);
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;

    if (this.tokenExpirado(token)) {
      // Si el access token expiró pero el refresh sigue válido, no hacer logout
      if (this.puedeRefrescar()) {
        return true;
      }
      this.logout();
      return false;
    }

    return true;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.usuarioKey);
    this._usuario.set(null);
  }

  obtenerUsuario(): any {
    return this._usuario();
  }

  private tokenExpirado(token: string): boolean {
    try {
      const payload = this.decodificarToken(token);
      if (!payload || !payload.exp) return true;
      const expiracion = payload.exp * 1000;
      return Date.now() >= expiracion;
    } catch {
      return true;
    }
  }

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

  private guardarTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, token);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  private guardarUsuario(usuario: any): void {
    localStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
  }

  private getUsuarioDelLocalStorage(): any {
    const usuario = localStorage.getItem(this.usuarioKey);
    return usuario ? JSON.parse(usuario) : null;
  }
}
