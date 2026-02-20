import { Pipe, PipeTransform } from '@angular/core';

/**
 * TruncatePipe — Recorta texto largo agregando ellipsis
 *
 * {{ texto | truncate }}         → máx 80 caracteres
 * {{ texto | truncate:40 }}      → máx 40 caracteres
 * {{ texto | truncate:40:'...' }}→ sufijo personalizado
 */
@Pipe({ name: 'truncate', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    limit = 80,
    suffix = '…'
  ): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit).trimEnd() + suffix;
  }
}