import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DrawDTO } from './draw.service';
import { BetHistoryDTO } from './bet.service';
import { environment } from '../../environments/environment';

/**
 * Interface que define os dados necessários para enviar um sorteio manual.
 */
export interface CustomDrawDTO {
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  fourthPrize: string;
  fifthPrize: string;
}

/**
 * Serviço que gerencia as chamadas de API para funções de administrador.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  // Injeta o cliente HTTP para realizar as requisições
  private readonly http = inject(HttpClient);
  // Define a URL base para os endpoints administrativos
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  /**
   * Solicita ao servidor a execução de um sorteio com números aleatórios.
   */
  triggerRandomDraw(): Observable<DrawDTO> {
    return this.http.post<DrawDTO>(`${this.apiUrl}/draws/random`, {});
  }

  /**
   * Envia números específicos para realizar um sorteio controlado/manual.
   */
  triggerCustomDraw(dto: CustomDrawDTO): Observable<DrawDTO> {
    return this.http.post<DrawDTO>(`${this.apiUrl}/draws/custom`, dto);
  }

  /**
   * Recupera do banco de dados a lista de todas as apostas feitas no sistema.
   */
  getAllSystemBets(): Observable<BetHistoryDTO[]> {
    return this.http.get<BetHistoryDTO[]>(`${this.apiUrl}/bets`);
  }
}