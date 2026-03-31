import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Tipagem rigorosa para evitar enviar dados errados
export type BetType = 'GROUP' | 'TENS' | 'THOUSANDS';
export type BetMode = 'SIMPLE' | 'SURROUNDED';
export type BetStatus = 'PENDING' | 'WINNER' | 'LOSER';

// DTO para envio de aposta
export interface BetRequestDTO {
  betType: BetType;
  betMode: BetMode;
  betValue: string;
  wagerAmount: number;
}

// Interface para o Histórico 
export interface BetHistoryDTO {
  id: number;
  betType: BetType;
  betMode: BetMode;
  betValue: string;
  wagerAmount: number;
  prizeWon: number;
  status: BetStatus;
  createdAt: string; 
}

@Injectable({
  providedIn: 'root'
})
export class BetService {
  //readonly para segurança contra modificações
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/bets';

  /**
   * Registra uma nova aposta no servidor.
   * * @param betRequest O objeto contendo os dados da aposta (tipo, valor, etc).
   * @returns Um Observable que emitirá a mensagem de sucesso vinda do Backend.
   * @throws Retorna erro 400 se o saldo for insuficiente.
   */
  placeBet(betRequest: BetRequestDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}`, betRequest, { 
      responseType: 'text' 
    }) as Observable<string>;
  }

  //Busca o histórico de apostas do usuário autenticado
    getHistory(): Observable<BetHistoryDTO[]> {
    return this.http.get<BetHistoryDTO[]>(`${this.apiUrl}/history`);
  }
}