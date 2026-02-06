import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { GastoRecurrenteService, GastoRecurrente } from './gasto-recurrente.service';
import { DeudaService, Deuda } from './deuda.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private readonly STORAGE_KEY = 'gastos_reminders_shown';

  constructor(
    private gastoRecurrenteService: GastoRecurrenteService,
    private deudaService: DeudaService,
    private notificationService: NotificationService
  ) {}

  /**
   * Verificar y mostrar recordatorios al usuario.
   * Solo muestra una vez al día por tipo de recordatorio.
   */
  verificarRecordatorios(): void {
    const hoy = new Date().toISOString().split('T')[0];
    const shownToday = this.getShownToday(hoy);

    forkJoin({
      recurrentes: this.gastoRecurrenteService.proximos(3),
      deudas: this.deudaService.obtenerDeudas(true)
    }).subscribe({
      next: ({ recurrentes, deudas }) => {
        // Recordatorios de gastos recurrentes pendientes (hoy o atrasados)
        const pendientesHoy = recurrentes.filter(g => g.diasHastaProxima <= 0);
        if (pendientesHoy.length > 0 && !shownToday.includes('recurrentes_pendientes')) {
          this.mostrarRecordatorioRecurrentes(pendientesHoy);
          this.markShown(hoy, 'recurrentes_pendientes');
        }

        // Recordatorios de gastos recurrentes próximos (1-3 días)
        const proximosDias = recurrentes.filter(g => g.diasHastaProxima > 0 && g.diasHastaProxima <= 3);
        if (proximosDias.length > 0 && !shownToday.includes('recurrentes_proximos')) {
          this.mostrarRecordatorioProximos(proximosDias);
          this.markShown(hoy, 'recurrentes_proximos');
        }

        // Recordatorios de deudas próximas a vencer
        const deudasProximas = deudas.filter(d => {
          if (!d.fechaVencimiento || d.estado !== 'ACTIVA') return false;
          const vencimiento = new Date(d.fechaVencimiento);
          const diasRestantes = Math.ceil((vencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return diasRestantes >= 0 && diasRestantes <= 7;
        });

        if (deudasProximas.length > 0 && !shownToday.includes('deudas_proximas')) {
          this.mostrarRecordatorioDeudas(deudasProximas);
          this.markShown(hoy, 'deudas_proximas');
        }
      }
    });
  }

  private mostrarRecordatorioRecurrentes(pendientes: GastoRecurrente[]): void {
    const total = pendientes.reduce((sum, g) => sum + g.monto, 0);
    const montoFormateado = new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', minimumFractionDigits: 0
    }).format(total);

    if (pendientes.length === 1) {
      this.notificationService.toast(
        `"${pendientes[0].descripcion}" pendiente de registro (${montoFormateado})`,
        'warning'
      );
    } else {
      this.notificationService.toast(
        `${pendientes.length} gastos recurrentes pendientes (${montoFormateado})`,
        'warning'
      );
    }
  }

  private mostrarRecordatorioProximos(proximos: GastoRecurrente[]): void {
    if (proximos.length === 1) {
      const g = proximos[0];
      const cuando = g.diasHastaProxima === 1 ? 'mañana' : `en ${g.diasHastaProxima} días`;
      this.notificationService.toast(
        `"${g.descripcion}" se ejecuta ${cuando}`,
        'info'
      );
    } else {
      this.notificationService.toast(
        `${proximos.length} gastos recurrentes en los próximos días`,
        'info'
      );
    }
  }

  private mostrarRecordatorioDeudas(deudas: Deuda[]): void {
    if (deudas.length === 1) {
      const d = deudas[0];
      const vencimiento = new Date(d.fechaVencimiento!);
      const diasRestantes = Math.ceil((vencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const cuando = diasRestantes === 0 ? 'hoy' : diasRestantes === 1 ? 'mañana' : `en ${diasRestantes} días`;
      this.notificationService.toast(
        `Deuda "${d.acreedor}" vence ${cuando}`,
        'warning'
      );
    } else {
      this.notificationService.toast(
        `${deudas.length} deudas próximas a vencer`,
        'warning'
      );
    }
  }

  private getShownToday(hoy: string): string[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (parsed.date !== hoy) return [];
      return parsed.shown || [];
    } catch {
      return [];
    }
  }

  private markShown(hoy: string, tipo: string): void {
    const shown = this.getShownToday(hoy);
    shown.push(tipo);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ date: hoy, shown }));
  }
}
