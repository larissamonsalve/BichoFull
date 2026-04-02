import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * @description DTO contendo os dados básicos do perfil do usuário.
 */
export interface UserProfile {
  name: string;
  username: string;
  balance: number;
}

/**
 * @description DTO contendo as estatísticas completas da carteira do usuário.
 */
export interface WalletStats {
  balance: number;
  totalWon: number;
  totalLost: number;
  totalPending: number;
  netProfit: number;
  pendingBetsCount: number;
}

/**
 * @description Serviço responsável pelas informações do usuário autenticado.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  /**
   * Obtém as informações básicas do perfil logado.
   * @returns Observable com os dados do perfil.
   */
  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }
  
  /**
   * Obtém os dados detalhados de saldo e estatísticas da carteira do usuário.
   * @returns Observable com os status da carteira.
   */
  getWallet(): Observable<WalletStats> {
    return this.http.get<WalletStats>(`${this.apiUrl}/wallet`);
  }
}