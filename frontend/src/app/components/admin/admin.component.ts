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
 * @description Componente responsável pelo Painel de Administração.
 * Permite a visualização de todas as apostas com paginação, controle de sorteios aleatórios
 * e a injeção de resultados manipulados (customizados).
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly animalService = inject(AnimalService);
  private readonly destroyRef = inject(DestroyRef);

  /** * @description Formulário reativo utilizado para inserir os 5 prêmios de um sorteio manual. 
   */
  customDrawForm!: FormGroup;
  
  // --- Sinais de Dados Base ---

  /** * @description Signal que armazena o histórico completo de apostas de todos os usuários. 
   */
  readonly allBets = signal<BetHistoryDTO[]>([]);

  /** * @description Signal que armazena a lista de animais carregados do sistema. 
   */
  readonly animals = signal<Animal[]>([]);

  /** * @description Signal que indica se o sistema está atualmente processando um sorteio. 
   */
  readonly isProcessing = signal<boolean>(false);
  
  /** * @description Computed Signal que filtra `allBets` para retornar apenas as apostas com status 'WINNER'. 
   */
  readonly winningBetsAll = computed(() => this.allBets().filter(b => b.status === 'WINNER'));

  // --- Estados de Paginação ---

  /** * @description Quantidade de itens a serem exibidos por página nas tabelas. 
   */
  readonly itemsPerPage = 10;
  
  /** @description Signal que armazena a página atual da tabela de pagamentos (vencedores). */
  readonly winCurrentPage = signal<number>(0);

  /** @description Computed Signal que calcula o total de páginas para a tabela de vencedores. */
  readonly winTotalPages = computed(() => Math.max(1, Math.ceil(this.winningBetsAll().length / this.itemsPerPage)));

  /** @description Computed Signal que retorna apenas a fatia de vencedores correspondente à página atual. */
  readonly winningBetsPaginated = computed(() => {
    const start = this.winCurrentPage() * this.itemsPerPage;
    return this.winningBetsAll().slice(start, start + this.itemsPerPage);
  });

  /** @description Signal que armazena a página atual da tabela de todas as apostas. */
  readonly allCurrentPage = signal<number>(0);

  /** @description Computed Signal que calcula o total de páginas para a tabela de todas as apostas. */
  readonly allTotalPages = computed(() => Math.max(1, Math.ceil(this.allBets().length / this.itemsPerPage)));

  /** @description Computed Signal que retorna apenas a fatia de apostas correspondente à página atual. */
  readonly allBetsPaginated = computed(() => {
    const start = this.allCurrentPage() * this.itemsPerPage;
    return this.allBets().slice(start, start + this.itemsPerPage);
  });

  /**
   * @method ngOnInit
   * @description Hook de ciclo de vida invocado ao inicializar o componente.
   * Verifica permissões de administrador, inicializa formulários e busca os dados da API.
   */
  ngOnInit(): void {
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
   * @method initForm
   * @description Inicializa o `customDrawForm` aplicando validações de formulário (apenas 4 dígitos numéricos).
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
   * @method loadAnimals
   * @description Consome a API de animais e atualiza o signal `animals`.
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
   * @method loadAllBets
   * @description Consome a API para buscar todas as apostas já feitas no sistema.
   * Reseta a paginação atual ao obter novos dados.
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
   * @method getAnimalForBet
   * @description Analisa a aposta para identificar qual animal foi jogado, seja por Grupo ou Dezena.
   * @param {BetHistoryDTO} bet O objeto da aposta.
   * @returns {Animal | undefined} O objeto Animal correspondente, ou undefined se não encontrar.
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

  // --- Controles de Paginação ---

  /** @description Avança para a próxima página na tabela de vencedores. */
  nextWinPage(): void { if (this.winCurrentPage() < this.winTotalPages() - 1) this.winCurrentPage.update(p => p + 1); }
  /** @description Volta para a página anterior na tabela de vencedores. */
  prevWinPage(): void { if (this.winCurrentPage() > 0) this.winCurrentPage.update(p => p - 1); }

  /** @description Avança para a próxima página na tabela de todas as apostas. */
  nextAllPage(): void { if (this.allCurrentPage() < this.allTotalPages() - 1) this.allCurrentPage.update(p => p + 1); }
  /** @description Volta para a página anterior na tabela de todas as apostas. */
  prevAllPage(): void { if (this.allCurrentPage() > 0) this.allCurrentPage.update(p => p - 1); }

  // --- Tradutores (Inglês -> Português) ---

  /**
   * @method translateStatus
   * @description Traduz o status da aposta vindo da API para português.
   * @param {string} status Status original ('WINNER', 'LOSER', 'PENDING').
   * @returns {string} Status traduzido.
   */
  translateStatus(status: string): string {
    switch (status) {
      case 'WINNER': return 'Ganhou';
      case 'LOSER': return 'Perdeu';
      case 'PENDING': return 'Pendente';
      default: return status;
    }
  }

  /**
   * @method translateType
   * @description Traduz o tipo de aposta vindo da API para português.
   * @param {string} type Tipo original ('GROUP', 'TENS', 'THOUSANDS').
   * @returns {string} Tipo traduzido.
   */
  translateType(type: string): string {
    switch (type) {
      case 'GROUP': return 'Grupo';
      case 'TENS': return 'Dezena';
      case 'THOUSANDS': return 'Milhar';
      default: return type;
    }
  }

  /**
   * @method translateMode
   * @description Traduz a modalidade de aposta vindo da API para português.
   * @param {string} mode Modo original ('SURROUNDED', 'SIMPLE').
   * @returns {string} Modo traduzido.
   */
  translateMode(mode: string): string {
    return mode === 'SURROUNDED' ? 'Cercada' : 'Simples';
  }

  // --- Sorteios ---

  /**
   * @method doRandomDraw
   * @description Pede confirmação e aciona a geração de um sorteio com números aleatórios (RNG) via API.
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
   * @method doCustomDraw
   * @description Pede confirmação e injeta os valores providenciados no `customDrawForm` como resultado final da roleta.
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
   * @method logout
   * @description Destrói a sessão atual do administrador e redireciona para a página principal.
   */
  logout(): void {
    this.authService.logout();
    this.toastService.show('Sessão encerrada com sucesso!', 'success');
    this.router.navigate(['/']);
  }
}