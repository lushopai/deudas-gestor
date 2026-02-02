import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'gastos_token';
  private usuarioKey = 'gastos_usuario';
  private usuarioSubject = new BehaviorSubject<any>(this.getUsuarioDelLocalStorage());

  usuario$ = this.usuarioSubject.asObservable();

  constructor(private apiService: ApiService) {}

  login(email: string, password: string): Observable<any> {
    return this.apiService.login(email, password).pipe(
      tap(response => {
        this.guardarToken(response.token);
        this.guardarUsuario(response.usuario);
        this.usuarioSubject.next(response.usuario);
      })
    );
  }

  registro(data: any): Observable<any> {
    return this.apiService.registro(data).pipe(
      tap(response => {
        this.guardarToken(response.token);
        this.guardarUsuario(response.usuario);
        this.usuarioSubject.next(response.usuario);
      })
    );
  }

  loginConGoogle(tokenGoogle: string): Observable<any> {
    return this.apiService.loginConGoogle(tokenGoogle).pipe(
      tap(response => {
        this.guardarToken(response.token);
        this.guardarUsuario(response.usuario);
        this.usuarioSubject.next(response.usuario);
      })
    );
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usuarioKey);
    this.usuarioSubject.next(null);
  }

  obtenerUsuario(): any {
    return this.usuarioSubject.value;
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
