import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToatsService, Toast } from '../toats.service';

@Component({
  selector: 'app-toast.component',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
readonly toastService = inject(ToatsService);

  readonly iconMap: Record<string, string> = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
  };
}
