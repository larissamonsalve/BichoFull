import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimalService, Animal } from '../../services/animal.service';

/**
 * @class HomeComponent
 * @description Componente da página inicial (Landing Page).
 * Apresenta o projeto e carrega uma amostra dos animais disponíveis.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  /** Injeção do serviço de animais para substituir a chamada HTTP hardcoded */
  private readonly animalService = inject(AnimalService);
  /** Referência para destruir inscrições automaticamente e evitar Memory Leaks */
  private readonly destroyRef = inject(DestroyRef);
  
  /** @description Signal reativo contendo a lista de animais carregados */
  readonly animals = signal<Animal[]>([]);

  /**
   * @description Hook de ciclo de vida executado na inicialização.
   * Busca a lista de animais e previne vazamento de memória com takeUntilDestroyed.
   */
  ngOnInit(): void {
    this.animalService.getAnimals().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => this.animals.set(data),
      error: (err) => console.error('Erro ao carregar animais:', err)
    });
  }

  /**
   * @description Rola a página suavemente até o elemento com o ID fornecido.
   * @param sectionId O ID da seção destino.
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}