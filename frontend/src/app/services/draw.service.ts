import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * @description DTO representando um sorteio finalizado.
 */
export interface DrawDTO {
  id: number;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  fourthPrize: string;
  fifthPrize: string;
  drawDate: string;
}

/**
 * @description Serviço para consulta do histórico de sorteios.
 */
@Injectable({
  providedIn: 'root'
})
export class DrawService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/draws`;

  /**
   * Obtém a lista dos últimos sorteios registrados no sistema.
   * @returns Observable contendo um array com os dados dos sorteios.
   */
  getDraws(): Observable<DrawDTO[]> {
    return this.http.get<DrawDTO[]>(this.apiUrl);
  }
}