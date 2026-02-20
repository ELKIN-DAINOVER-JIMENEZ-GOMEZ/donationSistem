import { Injectable, signal, computed } from '@angular/core';

/**
 * LoadingService
 * Gestiona el estado de carga global de la aplicación.
 * Soporta múltiples operaciones simultáneas con contador interno.
 *
 * Uso:
 *   loadingService.mostrar('login');
 *   // ... operación async
 *   loadingService.ocultar('login');
 *
 * O con el helper show/hide automático:
 *   loadingService.ejecutar('guardando', miObservable$)
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {

  /** Mapa de operaciones activas (clave → true) */
  private _operaciones = signal<Record<string, boolean>>({});

  /** True si hay al menos una operación en curso */
  readonly cargando = computed(() =>
    Object.values(this._operaciones()).some(Boolean)
  );

  /** Lista de claves activas (útil para debug) */
  readonly operacionesActivas = computed(() =>
    Object.entries(this._operaciones())
      .filter(([, activa]) => activa)
      .map(([key]) => key)
  );

  // ── API pública ────────────────────────────────────────────────────────────

  mostrar(clave = 'global'): void {
    this._operaciones.update(ops => ({ ...ops, [clave]: true }));
  }

  ocultar(clave = 'global'): void {
    this._operaciones.update(ops => {
      const nuevas = { ...ops };
      delete nuevas[clave];
      return nuevas;
    });
  }

  /** Limpia TODAS las operaciones (útil en logout o errores críticos) */
  limpiar(): void {
    this._operaciones.set({});
  }

  /** Verifica si una operación específica está activa */
  estaCargando(clave: string): boolean {
    return !!this._operaciones()[clave];
  }
}