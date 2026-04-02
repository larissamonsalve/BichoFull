import { Component, inject, OnInit, OnDestroy, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { DrawService, DrawDTO } from '../../services/draw.service';
import { AuthService } from '../../services/auth.service';
import { UserService, WalletStats } from '../../services/user.service';
import { BetService } from '../../services/bet.service';
import { ToastService } from '../../services/toast.service';
import { AnimalService, Animal } from '../../services/animal.service';

/**
 * @class DrawsComponent
 * @description
 * Componente responsável pela interface Arcade de Sorteios.
 * Controla a roleta tipo cassino com efeito CRT e a lógica de confetes.
 */
@Component({
  selector: 'app-draws',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './draws.component.html',
  styleUrls: ['./draws.component.css']
})
export class DrawsComponent implements OnInit, OnDestroy {
  // Serviços
  private readonly drawService = inject(DrawService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly betService = inject(BetService);
  private readonly toastService = inject(ToastService);
  private readonly animalService = inject(AnimalService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Estados Reativos
  readonly userName = signal<string>('');
  readonly wallet = signal<WalletStats>({
    balance: 0, totalWon: 0, totalLost: 0, totalPending: 0, netProfit: 0, pendingBetsCount: 0
  });
  
  readonly isAdmin = computed(() => this.authService.isAdmin());
  readonly draws = signal<DrawDTO[]>([]);
  readonly animals = signal<Animal[]>([]);
  readonly latestDraw = signal<DrawDTO | null>(null);
  
  readonly countdownObj = signal<{hours: string, minutes: string, seconds: string}>({hours: '00', minutes: '00', seconds: '00'});
  readonly nextDrawHour = signal<string>('00');
  readonly isDrawing = signal<boolean>(false);
  readonly showConfetti = signal<boolean>(false);
  
  private readonly userWinningBetsCount = signal<number>(0);

  // Configuração da Paginação Local
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = 20;
  
  readonly historyDraws = computed(() => this.draws().slice(1)); 
  
  readonly paginatedHistory = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.historyDraws().slice(start, end);
  });
  
  readonly totalPages = computed(() => Math.ceil(this.historyDraws().length / this.itemsPerPage));
  readonly slotNumbers = signal<string[]>(['0000', '0000', '0000', '0000', '0000']);
  
  // CORREÇÃO AQUI: Substituição do tipo 'any' pelo retorno correto do TypeScript para setInterval
  private timerInterval: ReturnType<typeof setInterval> | undefined;
  private slotInterval: ReturnType<typeof setInterval> | undefined;
  
  readonly confettiPieces = Array.from({ length: 70 }, (_, i) => i);

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadAnimals();
    this.loadDraws();
    this.startCountdownTimer();
    this.checkInitialWinningBets();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.slotInterval) clearInterval(this.slotInterval);
  }

  private loadUserProfile(): void {
    if (!this.authService.isLoggedIn()) return;
    
    this.userService.getMe().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => this.userName.set(profile.username)
    });
    this.userService.getWallet().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (stats) => this.wallet.set(stats)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); 
  }

  goHomeAndLogout(): void {
    this.authService.logout();
    this.toastService.show('Sessão encerrada com segurança.', 'success');
    this.router.navigate(['/']);
  }

  /**
   * @description Utiliza o serviço correto para buscar o dicionário de Animais.
   */
  private loadAnimals(): void {
    this.animalService.getAnimals().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.animals.set(data)
    });
  }

  private loadDraws(): void {
    this.drawService.getDraws().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.draws.set(data);
        if (data.length > 0) this.latestDraw.set(data[0]);
      }
    });
  }

  private checkInitialWinningBets(): void {
    if (!this.authService.isLoggedIn()) return;
    
    this.betService.getHistory().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const wins = response.content.filter(b => b.status === 'WINNER').length;
        this.userWinningBetsCount.set(wins);
      }
    });
  }

  private verifyIfUserWonAfterDraw(): void {
    if (!this.authService.isLoggedIn()) return;
    
    this.betService.getHistory().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const currentWins = response.content.filter(b => b.status === 'WINNER').length;
        
        if (currentWins > this.userWinningBetsCount()) {
          this.triggerConfetti();
          this.toastService.show('🎰 PARABÉNS! Ganhou no sorteio!', 'success', 6000);
        }
        
        this.userWinningBetsCount.set(currentWins);
        this.loadUserProfile();
      }
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  private startCountdownTimer(): void {
    this.timerInterval = setInterval(() => {
      const now = new Date();
      const nextDraw = this.calculateNextDrawTime(now);
      
      this.nextDrawHour.set(this.padZero(nextDraw.getHours()));
      const diff = nextDraw.getTime() - now.getTime();

      if (diff <= 0 && !this.isDrawing()) {
        this.triggerLiveDrawAnimation();
      } else if (diff > 0) {
        this.updateCountdownObj(diff);
      }
    }, 1000);
  }

  private calculateNextDrawTime(now: Date): Date {
    const drawHours = [11, 14, 16, 18, 21];
    const next = new Date(now);
    const currentHour = now.getHours();

    for (const h of drawHours) {
      if (currentHour < h) {
        next.setHours(h, 0, 0, 0);
        return next;
      }
    }
    next.setDate(next.getDate() + 1);
    next.setHours(11, 0, 0, 0);
    return next;
  }

  private updateCountdownObj(ms: number): void {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    this.countdownObj.set({
      hours: this.padZero(hours),
      minutes: this.padZero(minutes),
      seconds: this.padZero(seconds)
    });
  }

  private padZero(num: number): string { return num.toString().padStart(2, '0'); }

  private triggerLiveDrawAnimation(): void {
    this.isDrawing.set(true);
    
    this.slotInterval = setInterval(() => {
      this.slotNumbers.set(Array.from({length: 5}, () => 
        Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      ));
    }, 100);

    setTimeout(() => {
      if (this.slotInterval) clearInterval(this.slotInterval);
      
      this.drawService.getDraws().subscribe({
        next: (data) => {
          this.draws.set(data);
          if (data.length > 0) {
            const newDraw = data[0];
            this.latestDraw.set(newDraw);
            this.slotNumbers.set([
              newDraw.firstPrize, newDraw.secondPrize, 
              newDraw.thirdPrize, newDraw.fourthPrize, newDraw.fifthPrize
            ]);
          }
          this.isDrawing.set(false);
          this.verifyIfUserWonAfterDraw();
        }
      });
    }, 5000);
  }

  private triggerConfetti(): void {
    this.showConfetti.set(true);
    setTimeout(() => this.showConfetti.set(false), 8000);
  }

  getAnimalFromPrize(prize: string | undefined): Animal | undefined {
    if (!prize || this.animals().length === 0) return undefined;
    const tens = parseInt(prize.slice(-2), 10);
    const group = tens === 0 ? 25 : Math.ceil(tens / 4);
    return this.animals().find(a => a.groupNumber === group);
  }

  getPrizesArray(draw: DrawDTO | null): string[] {
    if (!draw) return [];
    return [draw.firstPrize, draw.secondPrize, draw.thirdPrize, draw.fourthPrize, draw.fifthPrize];
  }
}