import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

/**
 * @description Ficheiro de configuração global da aplicação (Bootstrap).
 * Fornece os serviços vitais, as rotas e configura o cliente HTTP com interceptores.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    
    // Configura o HttpClient para anexar o JWT através do interceptor funcional
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ]
};