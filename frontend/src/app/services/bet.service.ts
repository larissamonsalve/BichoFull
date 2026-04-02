import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type BetType = 'GROUP' | 'TENS' | 'THOUSANDS';
export type BetMode = 'SIMPLE' | 'SURROUNDED';
export type BetStatus = 'PENDING' | 'WINNER' | 'LOSER';

/**
 * @description DTO de requisição para criar uma nova aposta.
 */
export interface BetRequestDTO {
  betType: BetType;
  betMode: BetMode;
  betValue: string;
  wagerAmount: number;
}

/**
 * @description Interface representando o histórico de uma aposta individual.
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
 * @description Resposta paginada padrão do Spring Boot.
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * @description Resumo estatístico das apostas do utilizador.
 */
export interface BetHistorySummary {
  totalBets: number;
  winRate: number;
  totalWon: number;
  totalLost: number;
}

/**
 * @description Serviço responsável pelas operações relacionadas às apostas.
 */
@Injectable({
  providedIn: 'root'
})
export class BetService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/bets`;

  /**
   * Registra uma nova aposta no servidor.
   * @param betRequest O objeto contendo os dados da aposta.
   * @returns Um Observable com a mensagem de sucesso.
   */
  placeBet(betRequest: BetRequestDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}`, betRequest, { 
      responseType: 'text' 
    }) as Observable<string>;
  }

  /**
   * Busca o histórico de apostas do utilizador autenticado usando paginação.
   * CORREÇÃO: Removidas as anotações ': number' dos parâmetros,
   * permitindo que o TypeScript deduza os tipos automaticamente pelo '0' e '10'.
   * @param page O número da página (começa em 0).
   * @param size Quantidade de itens por página.
   * @returns Observable contendo os dados paginados.
   */
  getHistory(page = 0, size = 10): Observable<PaginatedResponse<BetHistoryDTO>> {
    return this.http.get<PaginatedResponse<BetHistoryDTO>>(`${this.apiUrl}/history?page=${page}&size=${size}`);
  }

  /**
   * Busca as estatísticas (resumo) das apostas do utilizador autenticado.
   * @returns Observable contendo o resumo consolidado.
   */
  getHistorySummary(): Observable<BetHistorySummary> {
    return this.http.get<BetHistorySummary>(`${this.apiUrl}/history/summary`);
  }
}