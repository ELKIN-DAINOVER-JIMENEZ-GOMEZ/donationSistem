import { Pipe, PipeTransform } from '@angular/core';
import { EstadoDonacion, ESTADO_LABELS } from '../../data/models/donacion.model';

/**
 * EstadoLabelPipe — Convierte EstadoDonacion en texto legible
 *
 * {{ 'PENDIENTE'  | estadoLabel }}  → "Pendiente"
 * {{ 'CONFIRMADA' | estadoLabel }}  → "Confirmada"
 * {{ 'RECHAZADA'  | estadoLabel }}  → "Rechazada"
 */
@Pipe({ name: 'estadoLabel', standalone: true, pure: true })
export class EstadoLabelPipe implements PipeTransform {
  transform(value: EstadoDonacion | null | undefined): string {
    if (!value) return '—';
    return ESTADO_LABELS[value] ?? value;
  }
}