import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DrawDTO } from './draw.service';
import { BetHistoryDTO } from './bet.service';
import { environment } from '../../environments/environment';

/**
 * @description DTO para o envio de um sorteio com resultados manipulados/customizados.
 */
export interface CustomDrawDTO {
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  fourthPrize: string;
  fifthPrize: string;
}

/**
 * @description Serviço responsável pelas operações restritas de administração.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  /**
   * Aciona a geração de um sorteio aleatório pelo motor RNG do Backend.
   * @returns Observable com os dados do sorteio gerado.
   */
  triggerRandomDraw(): Observable<DrawDTO> {
    return this.http.post<DrawDTO>(`${this.apiUrl}/draws/random`, {});
  }

  /**
   * Força o sistema a registrar um sorteio com valores customizados.
   * @param dto Os prêmios definidos manualmente pelo administrador.
   * @returns Observable com os dados do sorteio registrado.
   */
  triggerCustomDraw(dto: CustomDrawDTO): Observable<DrawDTO> {
    return this.http.post<DrawDTO>(`${this.apiUrl}/draws/custom`, dto);
  }

  /**
   * Busca todas as apostas já realizadas no sistema por todos os usuários.
   * @returns Observable contendo o histórico global de apostas.
   */
  getAllSystemBets(): Observable<BetHistoryDTO[]> {
    return this.http.get<BetHistoryDTO[]>(`${this.apiUrl}/bets`);
  }
}