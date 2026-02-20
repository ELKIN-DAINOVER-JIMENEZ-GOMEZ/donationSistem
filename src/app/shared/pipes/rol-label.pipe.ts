import { Pipe, PipeTransform } from '@angular/core';
import { RolUsuario, ROL_LABELS } from '../../data/models/usuario.model';

/**
 * RolLabelPipe — Convierte el enum RolUsuario en texto con emoji
 *
 * {{ 'DONANTE'       | rolLabel }}  → "💚 Donante"
 * {{ 'LIDER_SOCIAL'  | rolLabel }}  → "🌟 Líder Social"
 * {{ 'ADMINISTRADOR' | rolLabel }}  → "🛡️ Administrador"
 * {{ 'DONANTE'       | rolLabel:true }} → "Donante"  ← sin emoji
 */
@Pipe({ name: 'rolLabel', standalone: true, pure: true })
export class RolLabelPipe implements PipeTransform {
  transform(value: RolUsuario | null | undefined, noEmoji = false): string {
    if (!value) return '—';
    const label = ROL_LABELS[value] ?? value;
    return noEmoji ? label.replace(/^\S+\s/, '') : label;
  }
}