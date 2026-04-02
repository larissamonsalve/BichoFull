import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

/**
 * @class ToastComponent
 * @description Componente responsável por renderizar notificações flutuantes (Toasts) na interface.
 * Segue os padrões de acessibilidade WCAG, permitindo interação via teclado e leitores de ecrã.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" role="live" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="toast-item" 
          [ngClass]="toast.type"
          role="button"
          tabindex="0"
          (click)="removeToast(toast.id)"
          (keydown.enter)="removeToast(toast.id)"
          (keydown.space)="removeToast(toast.id)"
          [attr.aria-label]="'Fechar notificação: ' + toast.message">
          
          <span class="toast-content">{{ toast.message }}</span>
          
          <span class="close-hint" aria-hidden="true">×</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 15px;
      pointer-events: none;
    }

    .toast-item {
      min-width: 280px;
      padding: 16px 20px;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      font-family: 'Press Start 2P', system-ui, sans-serif;
      font-size: 0.7rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: transform 0.2s ease;
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    /* Feedback visual para navegação por teclado (Acessibilidade) */
    .toast-item:focus {
      outline: 3px solid #fff;
      outline-offset: 2px;
    }

    .toast-item:hover {
      transform: scale(1.02);
    }

    .toast-item.success {
      background-color: #166534;
      border-left: 6px solid #22c55e;
    }

    .toast-item.error {
      background-color: #7f1d1d;
      border-left: 6px solid #ef4444;
    }

    .close-hint {
      margin-left: 10px;
      font-size: 1.2rem;
      opacity: 0.7;
    }

    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  /** * Injeção protegida (readonly) do serviço de gestão de estados dos alertas 
   */
  protected readonly toastService = inject(ToastService);

  /**
   * Remove uma notificação específica com base no seu ID.
   * @param id Identificador único do toast.
   */
  removeToast(id: number): void {
    this.toastService.remove(id);
  }
}