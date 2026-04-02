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
  // Injeção de Serviços (Segura e Imutável)
  private readonly betService = inject(BetService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly animalService = inject(AnimalService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Estados do Utilizador
  readonly userName = signal<string>('');
  readonly wallet = signal<WalletStats>({
    balance: 0, totalWon: 0, totalLost: 0, totalPending: 0, netProfit: 0, pendingBetsCount: 0
  });

  // Estados do Histórico
  readonly summary = signal<BetHistorySummary | null>(null);
  readonly bets = signal<BetHistoryDTO[]>([]);
  readonly animals = signal<Animal[]>([]);
  
  // Paginação
  readonly currentPage = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly totalElements = signal<number>(0);
  
  readonly isAdmin = this.authService.isAdmin();

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadAnimals();
    this.loadSummary();
    this.loadBets();
  }

  /**
   * @description Carrega os dados do utilizador autenticado (Nome e Saldo).
   */
  private loadUserProfile(): void {
    if (!this.authService.isLoggedIn()) return;
    
    this.userService.getMe().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => this.userName.set(profile.username)
    });
    this.userService.getWallet().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (stats) => this.wallet.set(stats)
    });
  }

  /**
   * @description Encerra a sessão e retorna para a página principal.
   */
  goHomeAndLogout(): void {
    this.authService.logout();
    this.toastService.show('Sessão encerrada com sucesso!', 'success');
    this.router.navigate(['/']);
  }

  /**
   * @description Carrega o dicionário de animais através do AnimalService.
   */
  private loadAnimals(): void {
    this.animalService.getAnimals().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.animals.set(data)
    });
  }

  /**
   * @description Carrega os dados de resumo das estatísticas (Win Rate, Lucro, etc).
   */
  loadSummary(): void {
    this.betService.getHistorySummary().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.summary.set(data)
    });
  }

  /**
   * @description Carrega o histórico detalhado de apostas paginado.
   * CORREÇÃO: "page = 0" em vez de "page: number = 0" para aproveitar a inferência do TS.
   * @param page Índice da página que se pretende carregar.
   */
  loadBets(page = 0): void {
    this.betService.getHistory(page, 10).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.bets.set(response.content);
        this.currentPage.set(response.number);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
      }
    });
  }

  /**
   * @description Analisa a aposta e cruza os dados com o dicionário para retornar a imagem do animal.
   * @param bet Objeto com a aposta efetuada.
   */
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

  // ----- Tradutores para UI -----
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

  // ----- Ações de Paginação -----
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