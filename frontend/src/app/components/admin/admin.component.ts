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
 * Permite a visualização de todas as apostas, controlo de sorteios aleatórios
 * e a injeção de resultados customizados (manipulados).
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // --- Injeção Segura e Imutável (readonly) ---
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly animalService = inject(AnimalService);
  private readonly destroyRef = inject(DestroyRef); // Prevenção de Memory Leaks

  /** @description Formulário reativo para os sorteios customizados. */
  customDrawForm!: FormGroup;
  
  /** @description Signal reativo contendo o histórico de todas as apostas do sistema. */
  readonly allBets = signal<BetHistoryDTO[]>([]);
  
  /** @description Signal reativo contendo a lista de animais carregados da API. */
  readonly animals = signal<Animal[]>([]);
  
  /** @description Signal reativo para controlar o estado de carregamento/processamento. */
  readonly isProcessing = signal<boolean>(false);
  
  /** * @description Computed Signal que filtra automaticamente `allBets` 
   * para retornar apenas as apostas com status 'WINNER'.
   */
  readonly winningBets = computed(() => this.allBets().filter(b => b.status === 'WINNER'));

  /**
   * @method ngOnInit
   * @description Valida se o utilizador é administrador, inicializa o formulário e busca os dados iniciais.
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
   * @description Inicializa o formulário `customDrawForm` aplicando validações para 4 dígitos.
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
   * @description Busca a lista de animais na API via AnimalService.
   */
  private loadAnimals(): void {
    this.animalService.getAnimals().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => this.animals.set(data),
      error: () => this.toastService.show('Erro ao carregar imagens dos animais.', 'error')
    });
  }

  /**
   * @method loadAllBets
   * @description Busca todas as apostas registadas no sistema.
   */
  loadAllBets(): void {
    this.adminService.getAllSystemBets().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (bets) => this.allBets.set(bets),
      error: () => this.toastService.show('Erro ao carregar banco de apostas.', 'error')
    });
  }

  /**
   * @method getAnimalForBet
   * @description Descobre e retorna o animal correspondente a uma aposta específica.
   * @param bet Objeto da aposta.
   * @returns O objeto Animal correspondente, ou undefined se não encontrado.
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

  /**
   * @method doRandomDraw
   * @description Solicita confirmação e dispara um sorteio global aleatório (RNG).
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
   * @description Valida o formulário, pede confirmação e força um resultado manipulado no sistema.
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
   * @description Remove os dados da sessão do administrador e redireciona para a página inicial.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}