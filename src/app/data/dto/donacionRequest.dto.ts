import { TipoDonacion, EstadoDonacion, RankingDonante, EstadisticasDonante } from '../models/donacion.model';

// ─── Crear donación ───────────────────────────────────────────────────────────

/**
 * DTO de request para POST /api/donaciones
 * Espeja DonacionRequestDTO.java del backend.
 */
export interface DonacionRequestDTO {
  usuarioId: number;
  tipo: TipoDonacion;
  monto?: number;           // Requerido solo si tipo === 'MONETARIA'
  descripcion: string;
  detalleEspecies?: string; // Requerido solo si tipo === 'ESPECIES'
  comprobante?: string;     // URL o referencia del comprobante
}

// ─── Response de donación ─────────────────────────────────────────────────────

/**
 * DTO de response de los endpoints de donaciones.
 * Espeja DonacionResponseDTO.java del backend.
 */
export interface DonacionResponseDTO {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  emailUsuario: string;
  tipo: TipoDonacion;
  monto?: number;
  descripcion: string;
  detalleEspecies?: string;
  estado: EstadoDonacion;
  comprobante?: string;
  fechaDonacion: string;       // ISO 8601
  fechaConfirmacion?: string;  // ISO 8601
  notas?: string;
}

// ─── Confirmar / Rechazar (Admin) ─────────────────────────────────────────────

/**
 * Params para PATCH /api/donaciones/:id/confirmar
 */
export interface ConfirmarDonacionParams {
  notas?: string;
}

/**
 * Params para PATCH /api/donaciones/:id/rechazar
 */
export interface RechazarDonacionParams {
  motivo: string;
}

// ─── Filtros de consulta ──────────────────────────────────────────────────────

/**
 * Parámetros opcionales para consultar donaciones por fechas.
 * Coincide con los @RequestParam del endpoint GET /api/donaciones/fechas
 */
export interface DonacionFechasFiltroDTO {
  inicio: string; // ISO 8601 — ej. "2024-01-01T00:00:00"
  fin: string;    // ISO 8601 — ej. "2024-12-31T23:59:59"
}

// ─── Totales ──────────────────────────────────────────────────────────────────

/**
 * Response de GET /api/donaciones/usuario/:id/total
 */
export interface TotalDonadoResponseDTO {
  totalDonado: number;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

/**
 * DTO de response del endpoint GET /api/donaciones/ranking/top
 * Espeja RankingDonanteDTO.java del backend.
 */
export interface RankingDonanteResponseDTO {
  posicion: number;
  usuarioId: number;
  nombre: string;
  email: string;
  totalDonado: number;
  cantidadDonaciones: number;
  promedioDonacion: number;
}

/**
 * DTO de response del endpoint GET /api/donaciones/ranking/usuario/:id
 * Espeja el Map<String, Object> que devuelve el backend.
 */
export interface EstadisticasDonanteResponseDTO {
  usuarioId: number;
  totalDonado: number;
  cantidadDonaciones: number;
  promedioDonacion: number;
}

// ─── Mappers DTO ↔ Dominio ────────────────────────────────────────────────────

import { Donacion } from '../models/donacion.model';

/**
 * Convierte un DonacionResponseDTO del backend al modelo de dominio Donacion.
 */
export function toDonacionDomain(dto: DonacionResponseDTO): Donacion {
  return {
    id:                dto.id,
    usuarioId:         dto.usuarioId,
    nombreUsuario:     dto.nombreUsuario,
    emailUsuario:      dto.emailUsuario,
    tipo:              dto.tipo,
    monto:             dto.monto,
    descripcion:       dto.descripcion,
    detalleEspecies:   dto.detalleEspecies,
    estado:            dto.estado,
    comprobante:       dto.comprobante,
    fechaDonacion:     dto.fechaDonacion,
    fechaConfirmacion: dto.fechaConfirmacion,
    notas:             dto.notas,
  };
}

/**
 * Convierte un RankingDonanteResponseDTO al modelo de dominio RankingDonante.
 */
export function toRankingDonanteDomain(dto: RankingDonanteResponseDTO): RankingDonante {
  return { ...dto };
}

/**
 * Convierte un EstadisticasDonanteResponseDTO al modelo de dominio EstadisticasDonante.
 */
export function toEstadisticasDomain(dto: EstadisticasDonanteResponseDTO): EstadisticasDonante {
  return { ...dto };
}

/**
 * Construye un DonacionRequestDTO limpio a partir de los datos del formulario.
 * Elimina campos opcionales vacíos para no enviar ruido al backend.
 */
export function buildDonacionRequest(
  usuarioId: number,
  data: Omit<DonacionRequestDTO, 'usuarioId'>
): DonacionRequestDTO {
  const dto: DonacionRequestDTO = {
    usuarioId,
    tipo:        data.tipo,
    descripcion: data.descripcion.trim(),
  };

  if (data.tipo === 'MONETARIA' && data.monto != null) {
    dto.monto = data.monto;
  }

  if (data.tipo === 'ESPECIES' && data.detalleEspecies?.trim()) {
    dto.detalleEspecies = data.detalleEspecies.trim();
  }

  if (data.comprobante?.trim()) {
    dto.comprobante = data.comprobante.trim();
  }

  return dto;
}