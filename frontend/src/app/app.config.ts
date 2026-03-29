import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// 1. Mude as importações do HttpClient
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// 2. Importe a FUNÇÃO interceptor (não a classe)
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    
    // 3. Configure o HttpClient para usar Interceptors Funcionais
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ]
};