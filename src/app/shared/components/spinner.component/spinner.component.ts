import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
export type SpinnerSize = 'sm' | 'md' | 'lg';
@Component({
  selector: 'app-spinner.component',
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent {
@Input() size: SpinnerSize = 'md';
  @Input() label = 'Cargando...';
  @Input() showLabel = true;
  @Input() overlay = false;
}
