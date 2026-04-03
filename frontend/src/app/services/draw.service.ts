import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interface que define a estrutura de dados de um sorteio recebido do servidor.
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
 * Serviço responsável por buscar informações sobre os sorteios realizados.
 */
@Injectable({
  providedIn: 'root' // Torna o serviço disponível em toda a aplicação
})
export class DrawService {
  // Injeta o cliente HTTP para realizar requisições ao backend
  private readonly http = inject(HttpClient);
  // Define a URL base para os endpoints de sorteio
  private readonly apiUrl = `${environment.apiUrl}/draws`;

  /**
   * Realiza uma chamada GET para listar o histórico de sorteios.
   */
  getDraws(): Observable<DrawDTO[]> {
    return this.http.get<DrawDTO[]>(this.apiUrl);
  }
}