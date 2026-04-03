import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRegistrationDTO } from '../models/user.model';
import { environment } from '../../environments/environment';

/**
 * Interface que define o formato da resposta de sucesso no login (Token JWT).
 */
interface LoginResponse {
  token: string;
}

/**
 * Serviço que centraliza toda a lógica de autenticação, registro e controle de sessão.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Injeta o cliente HTTP para comunicação com o backend
  private readonly http = inject(HttpClient);
  // Define a URL base para autenticação vinda das configurações de ambiente
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Envia os dados do novo usuário para criação de conta no banco de dados.
   */
  register(userData: UserRegistrationDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, userData, { responseType: 'text' });
  }

  /**
   * Realiza a validação de credenciais e, se corretas, armazena o token no navegador.
   */
  login(credentials: { login: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Se houver um token na resposta, ele é salvo no LocalStorage para persistir o login
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
      }),
    );
  }

  /**
   * Decodifica o token salvo para verificar se o usuário logado é um administrador.
   */
  isAdmin(): boolean {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    
    try {
      // Divide o JWT e decodifica a parte do meio (payload) para ler a role
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);
      return payload.role === 'ADMIN';
    } catch { 
      return false;
    }
  }

  /**
   * Verifica se o usuário possui um token salvo, indicando que está autenticado.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  /**
   * Limpa os dados de autenticação do navegador, finalizando a sessão.
   */
  logout(): void {
    localStorage.removeItem('jwt_token');
  }
}