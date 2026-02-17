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

        // Verificar actualizaciones cada 30 minutos
        const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable));
        const every30Min$ = interval(30 * 60 * 1000);
        const every30MinOnceStable$ = concat(appIsStable$, every30Min$);

        every30MinOnceStable$.subscribe(() => {
            this.swUpdate.checkForUpdate().catch(() => { });
        });

        // Detectar cuando una nueva versión está lista
        this.swUpdate.versionUpdates.pipe(
            filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        ).subscribe(() => {
            this.notificationService.confirm(
                '¡Nueva versión disponible! ¿Deseas actualizar ahora?',
                'Actualización'
            ).then((result: boolean) => {
                if (result) {
                    window.location.reload();
                }
            });
        });

        // Si la nueva versión no se puede instalar, notificar
        this.swUpdate.unrecoverable.subscribe(() => {
            this.notificationService.error(
                'La aplicación necesita recargarse para funcionar correctamente.'
            );
            window.location.reload();
        });
    }
}
