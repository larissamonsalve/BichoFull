import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRegistrationDTO } from '../models/user.model';
import { environment } from '../../environments/environment';

/**
 * @description Resposta esperada do endpoint de login.
 */
interface LoginResponse {
  token: string;
}

/**
 * @description Serviço de autenticação e gerenciamento de sessão do utilizador.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Registra um novo utilizador no sistema.
   * @param userData Os dados do formulário de registo.
   * @returns Observable com a string de confirmação de cadastro.
   */
  register(userData: UserRegistrationDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, userData, { responseType: 'text' });
  }

  /**
   * Autentica o utilizador e salva o token JWT no LocalStorage.
   * @param credentials Objeto contendo login (email ou usuário) e senha.
   * @returns Observable com a resposta do login.
   */
  login(credentials: { login: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
      }),
    );
  }

  /**
   * Verifica se o utilizador atual logado possui a role 'ADMIN' lendo o payload do JWT.
   * Nota de segurança: É uma validação de UI, o backend sempre fará a validação real.
   * @returns True se for admin, False caso contrário.
   */
  isAdmin(): boolean {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);
      return payload.role === 'ADMIN';
    } catch { 
      // CORREÇÃO: "catch (e)" substituído por apenas "catch" (Optional Catch Binding)
      // para evitar a declaração de variáveis não utilizadas.
      return false;
    }
  }

  /**
   * Verifica se existe um token de sessão ativo.
   * @returns True se estiver logado.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  /**
   * Encerra a sessão removendo o token local.
   */
  logout(): void {
    localStorage.removeItem('jwt_token');
  }
}