import { HttpInterceptorFn } from '@angular/common/http';

/**
 * @description Interceptor funcional que anexa automaticamente o token JWT
 * ao cabeçalho (Header) de todas as requisições HTTP de saída, caso o usuário esteja autenticado.
 * * @param req A requisição HTTP original em andamento.
 * @param next O próximo manipulador na cadeia de interceptores.
 * @returns Um Observable do evento HTTP.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Tenta recuperar o token JWT armazenado no navegador
  const token = localStorage.getItem('jwt_token');

  // Verifica se o token existe
  if (token) {
    // Clona a requisição original e adiciona o cabeçalho de autorização com o token
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Envia a requisição modificada para o próximo passo
    return next(cloned);
  }

  // Se não houver token, envia a requisição original sem alterações
  return next(req);
};