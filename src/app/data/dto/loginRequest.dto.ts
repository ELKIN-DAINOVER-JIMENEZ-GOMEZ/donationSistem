import { RolUsuario } from '../models/usuario.model';

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * DTO de request para el endpoint POST /api/auth/login
 * Espeja LoginRequestDTO.java del backend.
 */
export interface LoginRequestDTO {
  email: string;
  password: string;
}

/**
 * DTO de response del endpoint POST /api/auth/login
 * Espeja LoginResponseDTO.java del backend.
 */
export interface LoginResponseDTO {
  token: string;
  type: string;      // Siempre "Bearer"
  email: string;
  nombre: string;
  rol: RolUsuario;
  userId: number;
}

// ─── Registro ─────────────────────────────────────────────────────────────────

/**
 * DTO de request para el endpoint POST /api/usuarios/registro
 * Espeja UsuarioRegistroDTO.java del backend.
 *
 * Nota: 'ADMINISTRADOR' no está disponible para auto-registro;
 * ese rol lo asigna un admin desde el panel.
 */
export interface RegisterRequestDTO {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  telefono?: string;
  organizacion?: string;
  rol: 'DONANTE' | 'LIDER_SOCIAL';
}

/**
 * DTO de response del endpoint POST /api/usuarios/registro
 * Espeja UsuarioResponseDTO.java del backend.
 */
export interface UsuarioResponseDTO {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  organizacion?: string;
  rol: RolUsuario;
  activo: boolean;
  fechaCreacion?: string;
}

// ─── Actualización de usuario ─────────────────────────────────────────────────

/**
 * DTO de request para PUT /api/usuarios/:id
 * Espeja UsuarioActualizacionDTO.java del backend.
 * Todos los campos son opcionales (PATCH semántico con PUT endpoint).
 */
export interface UsuarioActualizacionDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  telefono?: string;
  organizacion?: string;
}

// ─── Error de autenticación ───────────────────────────────────────────────────

/**
 * Estructura del cuerpo de error que devuelve AuthController.java
 * en respuestas 401 / 403.
 */
export interface AuthErrorResponseDTO {
  error: string;
  message: string;
}

// ─── Helpers de validación ────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valida un email con la misma regla que el backend */
export function esEmailValido(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/** Valida que la contraseña cumpla el mínimo de seguridad del backend (≥8 chars) */
export function esPasswordValida(password: string): boolean {
  return password.length >= 8;
}

/**
 * Construye un LoginRequestDTO limpio a partir de datos del formulario.
 * Recorta espacios en email y no modifica la contraseña.
 */
export function buildLoginRequest(email: string, password: string): LoginRequestDTO {
  return { email: email.trim().toLowerCase(), password };
}

/**
 * Construye un RegisterRequestDTO limpio a partir de los datos del formulario.
 * Normaliza el email y elimina campos vacíos opcionales.
 */
export function buildRegisterRequest(
  data: Omit<RegisterRequestDTO, 'email'> & { email: string }
): RegisterRequestDTO {
  const dto: RegisterRequestDTO = {
    nombre:   data.nombre.trim(),
    email:    data.email.trim().toLowerCase(),
    password: data.password,
    rol:      data.rol,
  };

  if (data.apellido?.trim())      dto.apellido      = data.apellido.trim();
  if (data.telefono?.trim())      dto.telefono      = data.telefono.trim();
  if (data.organizacion?.trim())  dto.organizacion  = data.organizacion.trim();

  return dto;
}