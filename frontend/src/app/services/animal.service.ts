import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * @description Estrutura de dados que representa um animal no jogo.
 */
export interface Animal {
  name: string;
  groupNumber: number;
  imagePath: string;
  tens: string[]; 
}

/**
 * @description Serviço responsável por comunicar com a API para obter os dados dos animais.
 */
@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/animals`;

  /**
   * Obtém a lista completa de animais disponíveis para aposta.
   * @returns Observable contendo um array de animais.
   */
  getAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.apiUrl);
  }
}