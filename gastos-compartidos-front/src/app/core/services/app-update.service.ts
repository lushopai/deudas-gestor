import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first } from 'rxjs/operators';
import { concat, interval } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class AppUpdateService {

    constructor(
        private swUpdate: SwUpdate,
        private appRef: ApplicationRef,
        private notificationService: NotificationService
    ) { }

    init(): void {
        if (!this.swUpdate.isEnabled) {
            return;
        }

        // Verificar actualizaciones cada 30 minutos una vez estable
        const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable));
        const every30Min$ = interval(30 * 60 * 1000);
        const every30MinOnceStable$ = concat(appIsStable$, every30Min$);

        every30MinOnceStable$.subscribe(() => {
            this.swUpdate.checkForUpdate().catch(() => { });
        });

        // Detectar cuando una nueva versión está lista
        this.swUpdate.versionUpdates.pipe(
            filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        ).subscribe(() => this.handleUpdate());

        // Si la nueva versión no se puede instalar, recargar automáticamente
        this.swUpdate.unrecoverable.subscribe(() => {
            window.location.reload();
        });
    }

    private handleUpdate(): void {
        // App en segundo plano (PWA minimizada o pantalla apagada): actualizar silenciosamente
        if (document.visibilityState === 'hidden') {
            this.swUpdate.activateUpdate().then(() => window.location.reload());
            return;
        }

        // Intentar notificación nativa del SO (funciona en PWA instalada)
        if ('Notification' in window && Notification.permission === 'granted') {
            this.showNativeNotification();
            return;
        }

        // Fallback: diálogo in-app para navegador sin permisos de notificación
        this.notificationService.confirm(
            '¡Nueva versión disponible! ¿Deseas actualizar ahora?',
            'Actualización'
        ).then((result: boolean) => {
            if (result) {
                this.swUpdate.activateUpdate().then(() => window.location.reload());
            }
        });
    }

    private showNativeNotification(): void {
        const notification = new Notification('Nueva versión disponible', {
            body: 'Hay una actualización lista. Toca para aplicarla.',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'app-update',         // Reemplaza notificaciones anteriores del mismo tipo
            requireInteraction: true,  // No desaparece sola en Android/desktop
        });

        notification.onclick = () => {
            notification.close();
            window.focus();
            this.swUpdate.activateUpdate().then(() => window.location.reload());
        };
    }
}
