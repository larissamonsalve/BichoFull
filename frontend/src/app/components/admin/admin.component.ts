import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { BetHistoryDTO } from '../../services/bet.service';
import { AnimalService, Animal } from '../../services/animal.service';

/**
 * @class AdminComponent
 * @description Componente do Painel Administrativo para controle de sorteios e visualização de apostas.
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // Injeção de dependências e serviços
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly animalService = inject(AnimalService);
  private readonly destroyRef = inject(DestroyRef);

  // Formulário para entrada manual de prêmios
  customDrawForm!: FormGroup;
  
  // --- Estados do Sistema (Signals) ---

  // Lista de todas as apostas do sistema
  readonly allBets = signal<BetHistoryDTO[]>([]);

  // Dicionário de animais carregados
  readonly animals = signal<Animal[]>([]);

  // Indica se um sorteio está em andamento para travar os botões
  readonly isProcessing = signal<boolean>(false);
  
  // Filtro reativo que retorna apenas apostas vencedoras
  readonly winningBetsAll = computed(() => this.allBets().filter(b => b.status === 'WINNER'));

  // --- Paginação da Tabela de Vencedores ---
  readonly itemsPerPage = 10;
  readonly winCurrentPage = signal<number>(0);
  readonly winTotalPages = computed(() => Math.max(1, Math.ceil(this.winningBetsAll().length / this.itemsPerPage)));
  readonly winningBetsPaginated = computed(() => {
    const start = this.winCurrentPage() * this.itemsPerPage;
    return this.winningBetsAll().slice(start, start + this.itemsPerPage);
  });

  // --- Paginação da Tabela Geral ---
  readonly allCurrentPage = signal<number>(0);
  readonly allTotalPages = computed(() => Math.max(1, Math.ceil(this.allBets().length / this.itemsPerPage)));
  readonly allBetsPaginated = computed(() => {
    const start = this.allCurrentPage() * this.itemsPerPage;
    return this.allBets().slice(start, start + this.itemsPerPage);
  });

  /**
   * Inicializa o componente verificando acesso e carregando dados base.
   */
  ngOnInit(): void {
    // Segurança: se não for admin, redireciona para o dashboard
    if (!this.authService.isAdmin()) {
      this.toastService.show('Acesso Negado. Área restrita.', 'error');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initForm();
    this.loadAnimals();
    this.loadAllBets();
  }

  /**
   * Cria o formulário reativo com validação de 4 dígitos para cada prêmio.
   */
  private initForm(): void {
    const pattern = /^[0-9]{4}$/;
    this.customDrawForm = this.fb.group({
      firstPrize: ['', [Validators.required, Validators.pattern(pattern)]],
      secondPrize: ['', [Validators.required, Validators.pattern(pattern)]],
      thirdPrize: ['', [Validators.required, Validators.pattern(pattern)]],
      fourthPrize: ['', [Validators.required, Validators.pattern(pattern)]],
      fifthPrize: ['', [Validators.required, Validators.pattern(pattern)]]
    });
  }

  /**
   * Carrega a lista de animais da API.
   */
  private loadAnimals(): void {
    this.animalService.getAnimals().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => this.animals.set(data),
      error: () => this.toastService.show('Erro ao carregar dicionário de animais.', 'error')
    });
  }

  /**
   * Carrega todas as apostas realizadas no sistema (global).
   */
  loadAllBets(): void {
    this.adminService.getAllSystemBets().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (bets) => {
        this.allBets.set(bets);
        this.winCurrentPage.set(0);
        this.allCurrentPage.set(0);
      },
      error: () => this.toastService.show('Erro ao carregar banco de apostas.', 'error')
    });
  }

  /**
   * Lógica para identificar qual animal pertence ao valor da aposta.
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

  // --- Funções de navegação de páginas ---
  nextWinPage(): void { if (this.winCurrentPage() < this.winTotalPages() - 1) this.winCurrentPage.update(p => p + 1); }
  prevWinPage(): void { if (this.winCurrentPage() > 0) this.winCurrentPage.update(p => p - 1); }
  nextAllPage(): void { if (this.allCurrentPage() < this.allTotalPages() - 1) this.allCurrentPage.update(p => p + 1); }
  prevAllPage(): void { if (this.allCurrentPage() > 0) this.allCurrentPage.update(p => p - 1); }

  // --- Tradutores de Termos da API ---

  translateStatus(status: string): string {
    switch (status) {
      case 'WINNER': return 'Ganhou';
      case 'LOSER': return 'Perdeu';
      case 'PENDING': return 'Pendente';
      default: return status;
    }
  }

  translateType(type: string): string {
    switch (type) {
      case 'GROUP': return 'Grupo';
      case 'TENS': return 'Dezena';
      case 'THOUSANDS': return 'Milhar';
      default: return type;
    }
  }

  translateMode(mode: string): string {
    return mode === 'SURROUNDED' ? 'Cercada' : 'Simples';
  }

  /**
   * Dispara um sorteio aleatório pelo servidor.
   */
  doRandomDraw(): void {
    if(confirm('⚠️ DISPARAR ROLETA: Tem a certeza que deseja realizar um Sorteio Aleatório?')) {
      this.isProcessing.set(true);
      this.adminService.triggerRandomDraw().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.toastService.show('🎰 Sorteio RNG concluído com sucesso!', 'success');
          this.loadAllBets();
          this.isProcessing.set(false);
        },
        error: () => {
          this.toastService.show('Erro ao conectar com o motor de sorteio.', 'error');
          this.isProcessing.set(false);
        }
      });
    }
  }

  /**
   * Dispara um sorteio com números específicos definidos no formulário.
   */
  doCustomDraw(): void {
    if (this.customDrawForm.invalid) {
      this.customDrawForm.markAllAsTouched();
      this.toastService.show('Verifique os 5 prémios (devem ter 4 dígitos).', 'error');
      return;
    }

    if(confirm('⚠️ MODO MANIPULADO: Forçar resultado customizado na Roleta?')) {
      this.isProcessing.set(true);
      this.adminService.triggerCustomDraw(this.customDrawForm.value).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.toastService.show('👾 Sorteio customizado disparado no sistema!', 'success');
          this.customDrawForm.reset();
          this.loadAllBets();
          this.isProcessing.set(false);
        },
        error: () => {
          this.toastService.show('Falha ao disparar sorteio.', 'error');
          this.isProcessing.set(false);
        }
      });
    }
  }

  /**
   * Encerra a sessão administrativa.
   */
  logout(): void {
    this.authService.logout();
    this.toastService.show('Sessão encerrada com sucesso!', 'success');
    this.router.navigate(['/']);
  }
}