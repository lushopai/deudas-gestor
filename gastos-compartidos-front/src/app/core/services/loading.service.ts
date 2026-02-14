import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signals privados
  private _loading = signal<boolean>(false);
  private _message = signal<string>('Cargando...');

  // Signals públicos readonly
  loading = this._loading.asReadonly();
  message = this._message.asReadonly();

  // Observables para compatibilidad con componentes que aún no migran
  loading$ = toObservable(this._loading);
  message$ = toObservable(this._message);

  /**
   * Muestra el overlay de loading
   */
  show(message: string = 'Cargando...'): void {
    this._message.set(message);
    this._loading.set(true);
  }

  /**
   * Oculta el overlay de loading
   */
  hide(): void {
    this._loading.set(false);
    this._message.set('Cargando...');
  }

  /**
   * Verifica si el loading está activo
   */
  isLoading(): boolean {
    return this._loading();
  }
}
