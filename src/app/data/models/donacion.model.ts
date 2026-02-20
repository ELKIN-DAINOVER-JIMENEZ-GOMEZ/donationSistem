import { Usuario } from './usuario.model';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TipoDonacion    = 'MONETARIA' | 'ESPECIES' | 'SERVICIOS';
export type EstadoDonacion  = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';

// ─── Modelo de Dominio ────────────────────────────────────────────────────────

/**
 * Modelo de dominio Donacion.
 * Espeja el objeto de negocio del backend (hexagonal domain layer).
 */
export interface Donacion {
  id: number;
  usuarioId: number;

  /** Datos del usuario incluidos en la respuesta del servidor */
  nombreUsuario?: string;
  emailUsuario?: string;

  tipo: TipoDonacion;
  monto?: number;            // Solo para MONETARIA
  descripcion: string;
  detalleEspecies?: string;  // Solo para ESPECIES
  estado: EstadoDonacion;
  comprobante?: string;      // URL o referencia del archivo
  fechaDonacion: string;     // ISO 8601
  fechaConfirmacion?: string;// ISO 8601
  notas?: string;            // Notas del administrador
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

export interface RankingDonante {
  posicion: number;
  usuarioId: number;
  nombre: string;
  email: string;
  totalDonado: number;
  cantidadDonaciones: number;
  promedioDonacion: number;
}

export interface EstadisticasDonante {
  usuarioId: number;
  totalDonado: number;
  cantidadDonaciones: number;
  promedioDonacion: number;
}

// ─── Helpers de dominio ───────────────────────────────────────────────────────

export const TIPO_LABELS: Record<TipoDonacion, string> = {
  MONETARIA: '💰 Monetaria',
  ESPECIES:  '📦 Especies',
  SERVICIOS: '🤝 Servicios',
};

export const ESTADO_LABELS: Record<EstadoDonacion, string> = {
  PENDIENTE:  'Pendiente',
  CONFIRMADA: 'Confirmada',
  RECHAZADA:  'Rechazada',
};

export const ESTADO_BADGE_VARIANT: Record<EstadoDonacion, 'warning' | 'success' | 'danger'> = {
  PENDIENTE:  'warning',
  CONFIRMADA: 'success',
  RECHAZADA:  'danger',
};

/** Monto mínimo permitido para donaciones monetarias */
export const MONTO_MINIMO = 1;

/** Monto máximo permitido para donaciones monetarias */
export const MONTO_MAXIMO = 1_000_000;

/** Verifica si una donación es monetaria */
export function esMonetaria(donacion: Pick<Donacion, 'tipo'>): boolean {
  return donacion.tipo === 'MONETARIA';
}

/** Verifica si una donación está en estado confirmada */
export function estaConfirmada(donacion: Pick<Donacion, 'estado'>): boolean {
  return donacion.estado === 'CONFIRMADA';
}

/** Verifica si una donación puede ser gestionada (no está en estado final) */
export function puedeGestionarse(donacion: Pick<Donacion, 'estado'>): boolean {
  return donacion.estado === 'PENDIENTE';
}

/**
 * Formatea el monto para mostrar en COP.
 * Devuelve una cadena vacía si la donación no es monetaria.
 */
export function formatearMonto(donacion: Pick<Donacion, 'tipo' | 'monto'>): string {
  if (donacion.tipo !== 'MONETARIA' || donacion.monto == null) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(donacion.monto);
}