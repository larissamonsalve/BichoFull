import { HttpInterceptorFn } from '@angular/common/http';

/**
 * @description Interceptor funcional que anexa automaticamente o token JWT
 * ao cabeçalho (Header) de todas as requisições HTTP de saída, caso o usuário esteja autenticado.
 * * @param req A requisição HTTP original em andamento.
 * @param next O próximo manipulador na cadeia de interceptores.
 * @returns Um Observable do evento HTTP.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt_token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};