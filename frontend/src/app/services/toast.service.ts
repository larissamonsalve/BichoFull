import { Injectable, signal } from '@angular/core';

/**
 * @description Interface para a estrutura da mensagem de notificação (Toast).
 */
export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

/**
 * @description Serviço para emissão de alertas flutuantes e notificações em tela.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /** Signal contendo a lista reativa de notificações ativas */
  readonly toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  /**
   * Adiciona e exibe uma nova notificação em tela.
   * @param message A mensagem que será exibida.
   * @param type Tipo da notificação: 'success' (verde) ou 'error' (vermelho).
   * @param durationMs Tempo em milissegundos para a notificação desaparecer (Padrão: 4000ms).
   */
  show(message: string, type: 'success' | 'error', durationMs = 4000): void {
    const id = this.counter++;
    this.toasts.update(current => [...current, { id, message, type }]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  /**
   * Remove imediatamente uma notificação baseada no ID fornecido.
   * @param id Identificador da notificação.
   */
  remove(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}