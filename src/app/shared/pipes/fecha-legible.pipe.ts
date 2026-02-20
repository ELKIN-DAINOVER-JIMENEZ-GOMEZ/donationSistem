import { Pipe, PipeTransform } from '@angular/core';

/**
 * FechaLegiblePipe — Convierte fechas ISO 8601 en texto legible en español
 *
 * {{ '2024-03-15T10:30:00' | fechaLegible }}          → "15 mar 2024, 10:30"
 * {{ '2024-03-15T10:30:00' | fechaLegible:'date' }}   → "15 de marzo de 2024"
 * {{ '2024-03-15T10:30:00' | fechaLegible:'short' }}  → "15/03/2024"
 * {{ '2024-03-15T10:30:00' | fechaLegible:'time' }}   → "10:30"
 * {{ '2024-03-15T10:30:00' | fechaLegible:'relative'}}→ "hace 2 días"
 */
@Pipe({ name: 'fechaLegible', standalone: true, pure: true })
export class FechaLegiblePipe implements PipeTransform {

  transform(
    value: string | Date | null | undefined,
    format: 'default' | 'date' | 'short' | 'time' | 'relative' = 'default'
  ): string {
    if (!value) return '—';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '—';

    const locale = 'es-CO';

    switch (format) {
      case 'date':
        return date.toLocaleDateString(locale, {
          day: 'numeric', month: 'long', year: 'numeric'
        });

      case 'short':
        return date.toLocaleDateString(locale, {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });

      case 'time':
        return date.toLocaleTimeString(locale, {
          hour: '2-digit', minute: '2-digit'
        });

      case 'relative':
        return this._relative(date);

      default: // 'default': fecha + hora corta
        return date.toLocaleDateString(locale, {
          day: 'numeric', month: 'short', year: 'numeric'
        }) + ', ' + date.toLocaleTimeString(locale, {
          hour: '2-digit', minute: '2-digit'
        });
    }
  }

  private _relative(date: Date): string {
    const now  = Date.now();
    const diff = now - date.getTime(); // ms
    const abs  = Math.abs(diff);
    const past = diff > 0;
    const prefix = past ? 'hace ' : 'en ';

    if (abs < 60_000)      return past ? 'hace un momento' : 'ahora mismo';
    if (abs < 3_600_000)   return `${prefix}${Math.floor(abs / 60_000)} min`;
    if (abs < 86_400_000)  return `${prefix}${Math.floor(abs / 3_600_000)} h`;
    if (abs < 604_800_000) return `${prefix}${Math.floor(abs / 86_400_000)} días`;
    if (abs < 2_592_000_000) return `${prefix}${Math.floor(abs / 604_800_000)} semanas`;
    return `${prefix}${Math.floor(abs / 2_592_000_000)} meses`;
  }
}