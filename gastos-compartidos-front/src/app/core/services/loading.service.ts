import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<string>('Cargando...');

  public loading$: Observable<boolean> = this.loadingSubject.asObservable();
  public message$: Observable<string> = this.messageSubject.asObservable();

  /**
   * Muestra el overlay de loading
   */
  show(message: string = 'Cargando...'): void {
    this.messageSubject.next(message);
    this.loadingSubject.next(true);
  }

  /**
   * Oculta el overlay de loading
   */
  hide(): void {
    this.loadingSubject.next(false);
    this.messageSubject.next('Cargando...');
  }

  /**
   * Verifica si el loading está activo
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
