import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interface para os dados básicos do perfil do usuário
export interface UserProfile {
  name: string;
  username: string;
  balance: number;
}

// Interface para os detalhes financeiros e de apostas da carteira
export interface WalletStats {
  balance: number;
  totalWon: number;
  totalLost: number;
  totalPending: number;
  netProfit: number;
  pendingBetsCount: number;
}

// Serviço que gerencia as informações do usuário logado
@Injectable({ providedIn: 'root' })
export class UserService {
  // Injeção do cliente HTTP e definição da URL base da API
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  // Busca os dados de identificação do usuário autenticado
  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }
  
  // Busca o saldo e as estatísticas financeiras detalhadas
  getWallet(): Observable<WalletStats> {
    return this.http.get<WalletStats>(`${this.apiUrl}/wallet`);
  }
}