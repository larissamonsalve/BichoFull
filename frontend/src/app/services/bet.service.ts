import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Definição dos tipos de dados para tipos, modos e status de aposta
export type BetType = 'GROUP' | 'TENS' | 'THOUSANDS';
export type BetMode = 'SIMPLE' | 'SURROUNDED';
export type BetStatus = 'PENDING' | 'WINNER' | 'LOSER';

/**
 * Interface para os dados enviados ao criar uma aposta.
 */
export interface BetRequestDTO {
  betType: BetType;
  betMode: BetMode;
  betValue: string;
  wagerAmount: number;
}

/**
 * Interface para os dados de uma aposta recebidos do histórico.
 */
export interface BetHistoryDTO {
  id: number;
  username?: string;
  email?: string;
  betType: BetType;
  betMode: BetMode;
  betValue: string;
  wagerAmount: number;
  prizeWon: number;
  status: BetStatus;
  createdAt: string; 
}

/**
 * Interface para formatar a resposta paginada do servidor.
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Interface para o resumo de estatísticas do usuário.
 */
export interface BetHistorySummary {
  totalBets: number;
  winRate: number;
  totalWon: number;
  totalLost: number;
}

/**
 * Serviço que gerencia as requisições de apostas para a API.
 */
@Injectable({
  providedIn: 'root'
})
export class BetService {
  // Injeção do cliente HTTP e definição da URL base
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/bets`;

  /**
   * Envia uma nova aposta para o servidor.
   */
  placeBet(betRequest: BetRequestDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}`, betRequest, { 
      responseType: 'text' 
    }) as Observable<string>;
  }

  /**
   * Busca o histórico de apostas do usuário logado de forma paginada.
   */
  getHistory(page = 0, size = 10): Observable<PaginatedResponse<BetHistoryDTO>> {
    return this.http.get<PaginatedResponse<BetHistoryDTO>>(`${this.apiUrl}/history?page=${page}&size=${size}`);
  }

  /**
   * Busca o resumo estatístico (ganhos, perdas, total) do usuário.
   */
  getHistorySummary(): Observable<BetHistorySummary> {
    return this.http.get<BetHistorySummary>(`${this.apiUrl}/history/summary`);
  }
}