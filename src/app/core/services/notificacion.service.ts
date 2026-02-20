import { Injectable, signal, computed } from '@angular/core';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export type NotificacionTipo = 'exito' | 'error' | 'advertencia' | 'info';

export interface Notificacion {
  id: string;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje?: string;
  duracion: number;       // ms
  icono: string;          // SVG path
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * NotificacionService
 * Gestiona toasts/snackbars globales (éxito, error, advertencia, info).
 *
 * Uso:
 *   notificacionService.exito('Donación creada', 'Se guardó correctamente.');
 *   notificacionService.error('Sin conexión');
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {

  private _lista = signal<Notificacion[]>([]);

  /** Lista reactiva de notificaciones activas */
  readonly lista = this._lista.asReadonly();

  /** True si hay al menos una notificación visible */
  readonly hayNotificaciones = computed(() => this._lista().length > 0);

  // ── API pública ────────────────────────────────────────────────────────────

  exito(titulo: string, mensaje?: string, duracion = 4000): void {
    this._agregar('exito', titulo, mensaje, duracion);
  }

  error(titulo: string, mensaje?: string, duracion = 6000): void {
    this._agregar('error', titulo, mensaje, duracion);
  }

  advertencia(titulo: string, mensaje?: string, duracion = 5000): void {
    this._agregar('advertencia', titulo, mensaje, duracion);
  }

  info(titulo: string, mensaje?: string, duracion = 4000): void {
    this._agregar('info', titulo, mensaje, duracion);
  }

  cerrar(id: string): void {
    this._lista.update(lista => lista.filter(n => n.id !== id));
  }

  limpiarTodas(): void {
    this._lista.set([]);
  }

  // ── Privados ───────────────────────────────────────────────────────────────

  private _agregar(
    tipo: NotificacionTipo,
    titulo: string,
    mensaje?: string,
    duracion = 4000
  ): void {
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const notificacion: Notificacion = {
      id,
      tipo,
      titulo,
      mensaje,
      duracion,
      icono: this._iconoPorTipo(tipo),
    };

    this._lista.update(lista => [...lista, notificacion]);

    // Auto-eliminar tras la duración
    setTimeout(() => this.cerrar(id), duracion);
  }

  private _iconoPorTipo(tipo: NotificacionTipo): string {
    const iconos: Record<NotificacionTipo, string> = {
      exito:      'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
      error:      'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
      advertencia:'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      info:       'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    };
    return iconos[tipo];
  }
}