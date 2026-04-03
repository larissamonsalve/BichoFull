import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimalService, Animal } from '../../services/animal.service';
import { InfoModalComponent } from '../info-modal/info-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, InfoModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Injeção de serviços e utilitários
  private readonly animalService = inject(AnimalService);
  private readonly destroyRef = inject(DestroyRef);

  // Sinais para controle do modal informativo
  readonly isModalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalContent = signal('');
  
  // Sinal que armazena a lista de animais vinda da API
  readonly animals = signal<Animal[]>([]);

  // Inicializa os dados ao abrir a página
  ngOnInit(): void {
    // Busca os animais e garante o cancelamento da inscrição ao destruir o componente
    this.animalService.getAnimals().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => this.animals.set(data),
      error: (err) => console.error('Erro ao carregar animais:', err)
    });
  }

  // Função para rolagem suave até uma seção específica da página
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Configura e abre o modal com base no tipo de informação clicada
  openInfo(type: string) {
    this.isModalOpen.set(true);
    
    if (type === 'termos') {
      this.modalTitle.set('Termos de Uso');
      this.modalContent.set(`
      <p>Este é um <strong>simulador educativo</strong>. Não há envolvimento de dinheiro real.</p>
      <ol style="padding-left: 20px; color: #e2e8f0;">
        <li>Créditos virtuais não possuem valor de resgate.</li>
        <li>O projeto tem fins estritamente acadêmicos.</li>
        <li>O motor RNG garante a aleatoriedade dos sorteios.</li>
      </ol>
    `);
    } 
    
    else if (type === 'privacidade') {
      this.modalTitle.set('Privacidade');
      this.modalContent.set(`
      <p>Levamos sua segurança a sério:</p>
      <ul style="padding-left: 20px; color: #e2e8f0;">
        <li>Sua senha é protegida por criptografia no banco de dados.</li>
        <li>Não compartilhamos seus dados com terceiros.</li>
        <li>Recomendamos o uso de senhas fictícias para este teste.</li>
      </ul>
    `);
    }
    
    else if (type === 'info') {
      this.modalTitle.set('Sobre o BichoFull');
      this.modalContent.set(`<p style="margin-bottom: 10px;">O BichoFull é um simulador educativo de sorteios.</p>
      <ul style="padding-left: 20px;">
        <li>Fichas 100% virtuais.</li>
        <li>Resultados aleatórios via RNG.</li>
        <li>Estética 8-bit Arcade.</li>
      </ul>
    `);
    }
    
    else if (type === 'suporte') {
      this.modalTitle.set('Suporte');
      this.modalContent.set('<p>Entre em contato pelo e-mail: larissamonsalve14@gmail.com</p>');
    }
    
    else if (type === 'marketing') {
      this.modalTitle.set('Jogue Agora!');
      this.modalContent.set(`
      <p>Crie sua conta e receba <strong>R$ 1.000 de bônus</strong> imediatamente!</p>
      <p>Teste sua sorte nos modos Simples ou Cercado e domine o ranking.</p>
    `);
    }
  }
}