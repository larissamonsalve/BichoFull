import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Verifica se é administrador utilizando o método que já criou no AuthService
  if (authService.isAdmin()) {
    return true;
  }

  // Se não for admin, recusa a entrada e atira-o de volta para o dashboard
  toastService.show('Acesso Negado. Área restrita a Administradores.', 'error');
  router.navigate(['/dashboard']);
  return false;
};