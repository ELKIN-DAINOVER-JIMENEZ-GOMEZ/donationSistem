import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number; // ms, default 4000
}

@Injectable({
  providedIn: 'root',
})
export class ToatsService {
    private _counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = 4000) {
    this._push({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000) {
    this._push({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4500) {
    this._push({ type: 'warning', message, duration });
  }

  info(message: string, duration = 4000) {
    this._push({ type: 'info', message, duration });
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private _push(toast: Omit<Toast, 'id'>) {
    const id = ++this._counter;
    this.toasts.update(list => [...list, { id, ...toast }]);
    setTimeout(() => this.dismiss(id), toast.duration ?? 4000);
  }
}
