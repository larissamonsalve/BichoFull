import { Injectable, signal } from '@angular/core';

/**
 * Interface que define a estrutura de cada mensagem de alerta (Toast).
 */
export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

/**
 * Serviço responsável por gerenciar a exibição de notificações temporárias no sistema.
 */
@Injectable({
  providedIn: 'root' // Disponibiliza o serviço globalmente na aplicação
})
export class ToastService {
  /** Signal que mantém a lista de notificações visíveis de forma reativa. */
  readonly toasts = signal<ToastMessage[]>([]);
  
  // Contador interno para gerar IDs únicos para cada mensagem.
  private counter = 0;

  /**
   * Cria uma nova notificação e programa sua remoção automática após o tempo definido.
   * @param message Texto a ser exibido.
   * @param type Categoria do alerta: sucesso ou erro.
   * @param durationMs Tempo de permanência na tela.
   */
  show(message: string, type: 'success' | 'error', durationMs = 4000): void {
    const id = this.counter++;
    
    // Adiciona o novo alerta ao array mantendo os anteriores.
    this.toasts.update(current => [...current, { id, message, type }]);

    // Define o cronômetro para remover o alerta automaticamente.
    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  /**
   * Remove uma notificação específica da lista usando o filtro por ID.
   * @param id Identificador da notificação a ser excluída.
   */
  remove(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}