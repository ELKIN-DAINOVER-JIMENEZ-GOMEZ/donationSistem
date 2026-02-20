import { Pipe, PipeTransform } from '@angular/core';
import { getIniciales } from '../../data/models/usuario.model';

/**
 * InicialesPipe — Genera las iniciales de un nombre
 *
 * {{ 'María González' | iniciales }}  → "MG"
 * {{ usuario | iniciales }}           → funciona con objeto { nombre, apellido }
 */
@Pipe({ name: 'iniciales', standalone: true, pure: true })
export class InicialesPipe implements PipeTransform {
  transform(value: string | { nombre: string; apellido?: string } | null | undefined): string {
    if (!value) return '??';

    if (typeof value === 'string') {
      const parts = value.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    return getIniciales(value);
  }
}