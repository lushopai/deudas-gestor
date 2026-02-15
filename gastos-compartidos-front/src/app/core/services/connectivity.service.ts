import { Injectable, signal } from '@angular/core';
import { fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  // Signal para estado de conectividad
  private _isOnline = signal<boolean>(navigator.onLine);
  public readonly isOnline = this._isOnline.asReadonly();

  constructor() {
    this.initConnectivityListener();
  }

  private initConnectivityListener(): void {
    // Escuchar eventos de cambio de conectividad
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(online => {
      this._isOnline.set(online);

      // Mostrar notificación al usuario
      if (online) {
        this.showOnlineNotification();
      } else {
        this.showOfflineNotification();
      }
    });
  }

  private showOnlineNotification(): void {
    // Notificación visual simple sin dependencias externas
    this.showToast('🟢 Conexión restaurada', 'success');
  }

  private showOfflineNotification(): void {
    this.showToast('🔴 Sin conexión a internet', 'warning');
  }

  private showToast(message: string, type: 'success' | 'warning'): void {
    // Crear toast simple sin dependencias
    const toast = document.createElement('div');
    toast.className = `connectivity-toast connectivity-toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4caf50' : '#ff9800'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // Remover después de 3 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Verifica si hay conexión haciendo un ping al backend
   */
  async checkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
