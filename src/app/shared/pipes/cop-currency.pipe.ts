import { Pipe, PipeTransform } from '@angular/core';

/**
 * CopCurrencyPipe — Formatea números en pesos colombianos (COP)
 *
 * {{ 50000 | copCurrency }}           → "$50.000"
 * {{ 50000 | copCurrency:'symbol' }}  → "COP 50.000"
 * {{ 1500.5 | copCurrency:'full' }}   → "$1.500,50"
 */
@Pipe({ name: 'copCurrency', standalone: true, pure: true })
export class CopCurrencyPipe implements PipeTransform {

  transform(
    value: number | null | undefined,
    mode: 'symbol' | 'code' | 'full' = 'symbol'
  ): string {
    if (value == null || isNaN(value)) return '—';

    const decimals = mode === 'full' ? 2 : 0;

    const formatted = new Intl.NumberFormat('es-CO', {
      style:                 'currency',
      currency:              'COP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);

    // 'es-CO' con COP devuelve "$ 50.000" → limpiar espacio extra
    return formatted.replace(/\s+/, '\u00A0');
  }
}