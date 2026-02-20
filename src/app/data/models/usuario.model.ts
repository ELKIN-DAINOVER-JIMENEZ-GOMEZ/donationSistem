// ─── Enums ────────────────────────────────────────────────────────────────────

export type RolUsuario = 'DONANTE' | 'LIDER_SOCIAL' | 'ADMINISTRADOR';

// ─── Modelo de Dominio ────────────────────────────────────────────────────────

/**
 * Modelo de dominio Usuario.
 * Espeja el objeto de negocio del backend (hexagonal domain layer).
 */
export interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  organizacion?: string;
  rol: RolUsuario;
  activo: boolean;
  fechaCreacion?: string; // ISO 8601
  fechaActualizacion?: string; // ISO 8601
}

// ─── Sesión del usuario autenticado ──────────────────────────────────────────

/**
 * Subconjunto del usuario almacenado en localStorage tras el login.
 * Evita guardar datos sensibles innecesarios.
 */
export interface UsuarioSesion {
  userId: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

// ─── Helpers de dominio ───────────────────────────────────────────────────────

export const ROL_LABELS: Record<RolUsuario, string> = {
  DONANTE:       '💚 Donante',
  LIDER_SOCIAL:  '🌟 Líder Social',
  ADMINISTRADOR: '🛡️ Administrador',
};

export const ROL_BADGE_VARIANT: Record<RolUsuario, 'success' | 'warning' | 'danger'> = {
  DONANTE:       'success',
  LIDER_SOCIAL:  'warning',
  ADMINISTRADOR: 'danger',
};

/** Devuelve el nombre completo del usuario */
export function getNombreCompleto(usuario: Pick<Usuario, 'nombre' | 'apellido'>): string {
  return [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');
}

/** Genera iniciales para avatar */
export function getIniciales(usuario: Pick<Usuario, 'nombre' | 'apellido'>): string {
  const nombre   = usuario.nombre?.charAt(0).toUpperCase() ?? '';
  const apellido = usuario.apellido?.charAt(0).toUpperCase() ?? '';
  return nombre + apellido || '??';
}

/** Verifica si el usuario puede gestionar donaciones */
export function puedeGestionarDonaciones(rol: RolUsuario): boolean {
  return rol === 'ADMINISTRADOR';
}

/** Verifica si el usuario puede crear solicitudes */
export function puedeCrearSolicitudes(rol: RolUsuario): boolean {
  return rol === 'LIDER_SOCIAL' || rol === 'ADMINISTRADOR';
}