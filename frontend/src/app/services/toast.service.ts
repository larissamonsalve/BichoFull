// app/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Lista reativa de avisos ativos
  toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  // Mostra a mensagem e define o tempo para desaparecer (padrão: 4 segundos)
  show(message: string, type: 'success' | 'error', durationMs = 4000) {
    const id = this.counter++;
    this.toasts.update(current => [...current, { id, message, type }]);

    // Remove automaticamente após o tempo acabar
    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  // Permite remover ao clicar
  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}