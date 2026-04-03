import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  // Injeta o serviço de Toasts para acessar a lista de notificações ativas
  protected readonly toastService = inject(ToastService);

  /**
   * Remove uma notificação específica chamando o método de exclusão do serviço.
   * @param id Identificador único do toast a ser removido.
   */
  removeToast(id: number): void {
    this.toastService.remove(id);
  }
}