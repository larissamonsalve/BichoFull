import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { BetService, BetHistoryDTO, BetHistorySummary } from '../../services/bet.service';
import { AuthService } from '../../services/auth.service';
import { UserService, WalletStats } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { AnimalService, Animal } from '../../services/animal.service';

/**
 * @class HistoryComponent
 * @description Componente responsável por renderizar o histórico de apostas
 * com paginação e o resumo estatístico do utilizador.
 */
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  private readonly betService = inject(BetService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly animalService = inject(AnimalService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Estados Reativos (Signals) para dados do Utilizador
  readonly userName = signal<string>('');
  readonly wallet = signal<WalletStats>({
    balance: 0, totalWon: 0, totalLost: 0, totalPending: 0, netProfit: 0, pendingBetsCount: 0
  });

  // Estados Reativos (Signals) para o Histórico e Lista de Animais
  readonly summary = signal<BetHistorySummary | null>(null);
  readonly bets = signal<BetHistoryDTO[]>([]);
  readonly animals = signal<Animal[]>([]);
  
  // Controle de Paginação
  readonly currentPage = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly totalElements = signal<number>(0);
  
  // Verifica se o utilizador atual é um administrador
  readonly isAdmin = this.authService.isAdmin();

  // Ciclo de vida: Inicializa os dados ao abrir a tela
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadAnimals();
    this.loadSummary();
    this.loadBets();
  }

  // Carrega os dados do perfil (nome e carteira) do utilizador autenticado.
  private loadUserProfile(): void {
    if (!this.authService.isLoggedIn()) return;
    
    this.userService.getMe().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => this.userName.set(profile.username)
    });
    this.userService.getWallet().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (stats) => this.wallet.set(stats)
    });
  }

  //Executa o logout, limpa a sessão e redireciona para a página inicial.

  goHomeAndLogout(): void {
    this.authService.logout();
    this.toastService.show('Sessão encerrada com sucesso!', 'success');
    this.router.navigate(['/']);
  }

  //Busca a lista de animais do sistema para exibir as imagens no histórico.

  private loadAnimals(): void {
    this.animalService.getAnimals().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.animals.set(data)
    });
  }

  // Carrega o resumo estatístico das apostas (Total, Win Rate, Lucro/Perda).
  loadSummary(): void {
    this.betService.getHistorySummary().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.summary.set(data)
    });
  }

  //Carrega as apostas do utilizador de forma paginada (5 itens por página).
  
  loadBets(page = 0): void {
    this.betService.getHistory(page, 5).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.bets.set(response.content);
        this.currentPage.set(response.number);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
      }
    });
  }

  //Identifica qual bicho pertence à aposta com base no valor jogado.
  getAnimalForBet(bet: BetHistoryDTO): Animal | undefined {
    if (!bet || this.animals().length === 0) return undefined;
    
    let group = 0;
    if (bet.betType === 'GROUP') {
      group = parseInt(bet.betValue, 10);
    } else {
      const tens = parseInt(bet.betValue.slice(-2), 10);
      group = tens === 0 ? 25 : Math.ceil(tens / 4);
    }
    
    return this.animals().find(a => a.groupNumber === group);
  }

  // ----- Métodos de Tradução para exibição na Interface (UI) -----

  translateMode(mode: string): string {
    return mode === 'SURROUNDED' ? 'Cercada' : 'Simples';
  }

  translateType(type: string): string {
    switch (type) {
      case 'GROUP': return 'Grupo';
      case 'TENS': return 'Dezena';
      case 'THOUSANDS': return 'Milhar';
      default: return type;
    }
  }

  translateStatus(status: string): string {
    switch (status) {
      case 'WINNER': return 'Ganhou';
      case 'LOSER': return 'Perdeu';
      case 'PENDING': return 'Pendente';
      default: return status;
    }
  }

  // -----Funções de Controle da Paginação -----
  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadBets(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.loadBets(this.currentPage() - 1);
    }
  }
}