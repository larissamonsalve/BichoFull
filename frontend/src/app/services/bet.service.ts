// app/services/bet.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Tipagem rigorosa para evitar enviar dados errados
export type BetType = 'GROUP' | 'TENS' | 'THOUSANDS';
export type BetMode = 'SIMPLE' | 'SURROUNDED'; 

export interface BetRequestDTO {
  betType: BetType;
  betMode: BetMode;
  betValue: string;
  wagerAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class BetService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/bets';

  placeBet(betRequest: BetRequestDTO): Observable<string> {
    // responseType: 'text' porque o backend retorna apenas a string "Aposta realizada com sucesso!"
    return this.http.post(`${this.apiUrl}`, betRequest, { responseType: 'text' });
  }

  // Método preparado para o endpoint de histórico que criámos
  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }
}