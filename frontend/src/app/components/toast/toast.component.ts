// app/components/toast/toast.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="toast.type" (click)="toastService.remove(toast.id)">
          {{ toast.message }}
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
      pointer-events: none; /* Deixa clicar no que está atrás se não for no toast */
    }
    .toast-item {
      min-width: 280px;
      padding: 16px 20px;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      font-family: system-ui, sans-serif;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      cursor: pointer;
      pointer-events: auto; /* Reativa o clique no toast */
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    /* Estilo alinhado com o seu Tema Arcade */
    .toast-item.success {
      background-color: #166534;
      border-left: 6px solid #22c55e;
    }
    .toast-item.error {
      background-color: #7f1d1d;
      border-left: 6px solid #ef4444;
    }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}