import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Observable, from, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { toObservable } from '@angular/core/rxjs-interop';

export interface PushConfig {
    enabled: boolean;
    publicKey?: string;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {
    private readonly apiUrl = environment.apiUrl;

    // Signal privado para el estado de suscripción
    private _isSubscribed = signal<boolean>(false);

    // Signal público readonly
    isSubscribed = this._isSubscribed.asReadonly();

    // Observable para compatibilidad con componentes que aún no migran
    isSubscribed$ = toObservable(this._isSubscribed);

    constructor(
        private http: HttpClient,
        private swPush: SwPush
    ) {
        // Verificar estado actual de suscripción
        if (this.swPush.isEnabled) {
            this.swPush.subscription.subscribe(sub => {
                this._isSubscribed.set(!!sub);
            });

            // Manejar clicks en notificaciones
            this.swPush.notificationClicks.subscribe(({ action, notification }) => {
                const url = notification?.data?.url || '/dashboard';
                window.open(url, '_self');
            });
        }
    }

    /**
     * Obtiene la configuración push del servidor (si VAPID está habilitado)
     */
    getConfig(): Observable<PushConfig> {
        return this.http.get<PushConfig>(`${this.apiUrl}/push/vapid-key`);
    }

    /**
     * Verifica si las notificaciones push son soportadas en este navegador
     */
    isSupported(): boolean {
        return this.swPush.isEnabled && 'Notification' in window;
    }

    /**
     * Obtiene el estado actual del permiso de notificaciones
     */
    getPermissionState(): NotificationPermission {
        if (!('Notification' in window)) return 'denied';
        return Notification.permission;
    }

    /**
     * Suscribirse a notificaciones push.
     * 1. Obtiene la VAPID public key del servidor
     * 2. Solicita permiso al usuario
     * 3. Registra la suscripción en el Service Worker
     * 4. Envía la suscripción al backend
     */
    subscribe(): Observable<any> {
        return this.getConfig().pipe(
            switchMap(config => {
                if (!config.enabled || !config.publicKey) {
                    return of({ error: 'Push notifications no están habilitadas en el servidor' });
                }

                return from(this.swPush.requestSubscription({
                    serverPublicKey: config.publicKey
                })).pipe(
                    switchMap(sub => {
                        const json = sub.toJSON();
                        return this.http.post(`${this.apiUrl}/push/subscribe`, {
                            endpoint: json.endpoint,
                            keys: {
                                p256dh: json.keys?.['p256dh'],
                                auth: json.keys?.['auth']
                            }
                        });
                    }),
                    tap(() => this._isSubscribed.set(true))
                );
            }),
            catchError(err => {
                console.error('Error al suscribirse a push:', err);
                return of({ error: err.message || 'Error al suscribirse' });
            })
        );
    }

    /**
     * Desuscribirse de notificaciones push
     */
    unsubscribe(): Observable<any> {
        return from(this.swPush.subscription).pipe(
            switchMap(sub => {
                if (!sub) return of(null);

                const endpoint = sub.endpoint;
                return from(sub.unsubscribe()).pipe(
                    switchMap(() => this.http.post(`${this.apiUrl}/push/unsubscribe`, { endpoint })),
                    tap(() => this._isSubscribed.set(false))
                );
            }),
            catchError(err => {
                console.error('Error al desuscribirse:', err);
                return of({ error: err.message });
            })
        );
    }

    /**
     * Enviar notificación de prueba
     */
    testNotification(): Observable<any> {
        return this.http.post(`${this.apiUrl}/push/test`, {});
    }
}
