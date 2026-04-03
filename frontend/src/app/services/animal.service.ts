import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interface que define as propriedades de um animal no sistema
 */
export interface Animal {
  name: string;
  groupNumber: number;
  imagePath: string;
  tens: string[]; 
}

/**
 * Serviço responsável pelas requisições relacionadas aos animais
 */
@Injectable({
  providedIn: 'root' // Torna o serviço disponível em toda a aplicação
})
export class AnimalService {
  // Injeta o cliente HTTP para realizar as chamadas à API
  private readonly http = inject(HttpClient);
  // Define a URL do endpoint buscando a base do arquivo de ambiente
  private readonly apiUrl = `${environment.apiUrl}/animals`;

  /**
   * Realiza uma requisição GET para buscar todos os animais cadastrados
   */
  getAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.apiUrl);
  }
}