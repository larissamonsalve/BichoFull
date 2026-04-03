import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Se estiver logado, permite o acesso à rota
  if (authService.isLoggedIn()) {
    return true;
  }

  // Se não estiver, avisa o utilizador, redireciona para o login e bloqueia a rota
  toastService.show('Precisa de iniciar sessão para aceder a esta página.', 'error');
  router.navigate(['/login']);
  return false;
};