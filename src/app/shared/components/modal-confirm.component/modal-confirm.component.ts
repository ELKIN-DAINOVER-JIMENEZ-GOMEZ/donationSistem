import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button.component/button.component';

@Component({
  selector: 'app-modal-confirm',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './modal-confirm.component.html',
  styleUrl: './modal-confirm.component.css',
})
export class ModalConfirmComponent {
@Input() open = false;
  @Input() title = '¿Confirmar acción?';
  @Input() message = '¿Estás seguro de que deseas continuar?';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel  = 'Cancelar';
  @Input() variant: 'danger' | 'warning' | 'info' | 'success' = 'warning';
  @Input() loading = false;
  @Input() loadingText = 'Procesando...';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancelled.emit();
    }
  }
}
