import { Component, inject, OnInit, signal, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

import { BetService, BetType } from '../../services/bet.service';
import { ToastService } from '../../services/toast.service';
import { UserService, WalletStats } from '../../services/user.service'; 
import { AuthService } from '../../services/auth.service';
import { AnimalService, Animal } from '../../services/animal.service';
import { PAYOUT_MULTIPLIERS } from '../../constants/bet.constants'; 

/**
 * @class DashboardComponent
 * @description Componente principal do Painel Arcade.
 * Gerencia a lógica de apostas, visualização da carteira e listagem de animais.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly betService = inject(BetService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly animalService = inject(AnimalService);
  private readonly router = inject(Router);
  
  // Usado para cancelar as inscrições (Observables) automaticamente quando o componente for destruído
  private readonly destroyRef = inject(DestroyRef);

  readonly animals = signal<Animal[]>([]);
  readonly wallet = signal<WalletStats>({
    balance: 0, totalWon: 0, totalLost: 0, totalPending: 0, netProfit: 0, pendingBetsCount: 0
  });
  readonly userName = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly selectedAnimal = signal<Animal | null>(null);
  
  readonly potentialWinnings = signal<number>(0);
  
  readonly isAdmin = computed(() => this.authService.isAdmin());

  betForm!: FormGroup;
  readonly quickValues = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadWallet();
    this.loadAnimals();
    this.initForm();
    this.setupDynamicValidators();
    this.setupWinningsCalculator(); 
  }

  private loadUserProfile(): void {
    if (!this.authService.isLoggedIn()) return;
    
    this.userService.getMe().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => this.userName.set(profile.username),
      error: () => this.toastService.show('Erro ao carregar dados do utilizador.', 'error')
    });
  }

  private loadWallet(): void {
    if (!this.authService.isLoggedIn()) return;
    
    this.userService.getWallet().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (stats) => this.wallet.set(stats),
      error: () => this.toastService.show('Erro ao carregar carteira.', 'error')
    });
  }

  private loadAnimals(): void {
    this.animalService.getAnimals().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.animals.set(data),
      error: () => this.toastService.show('Erro ao carregar animais', 'error')
    });
  }

  logout(): void {
    this.authService.logout(); 
    this.toastService.show('Sessão encerrada com sucesso!', 'success');
    this.router.navigate(['/']); 
  }

  selectAnimal(animal: Animal): void {
    this.selectedAnimal.set(animal);
    
    this.betForm.patchValue({
      betType: 'GROUP',
      betValue: animal.groupNumber.toString()
    });
    this.toastService.show(`${animal.name} selecionado!`, 'success');
  }

  private initForm(): void {
    this.betForm = this.fb.group({
      betType: ['GROUP', Validators.required],
      betMode: ['SIMPLE', Validators.required],
      betValue: ['', [Validators.required, Validators.min(1), Validators.max(25)]],
      wagerAmount: [null, [Validators.required, Validators.min(0.01)]] 
    });
  }

  private setupDynamicValidators(): void {
    this.betForm.get('betType')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((type: BetType) => {
      const valueControl = this.betForm.get('betValue');
      if (!valueControl) return;

      valueControl.clearValidators();

      if (type === 'GROUP') {
        valueControl.setValidators([Validators.required, Validators.min(1), Validators.max(25)]);
      } else if (type === 'TENS') {
        valueControl.setValidators([Validators.required, Validators.pattern(/^[0-9]{2}$/)]);
      } else if (type === 'THOUSANDS') {
        valueControl.setValidators([Validators.required, Validators.pattern(/^[0-9]{4}$/)]);
      }
      
      valueControl.updateValueAndValidity();
      valueControl.setValue('');
    });
  }

  private setupWinningsCalculator(): void {
    this.betForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((formValue) => {
      const amount = formValue.wagerAmount || 0;
      
      if (amount <= 0) {
        this.potentialWinnings.set(0);
        return;
      }

      let multiplier = 0;
      
      if (formValue.betType === 'GROUP') multiplier = PAYOUT_MULTIPLIERS.GROUP;
      else if (formValue.betType === 'TENS') multiplier = PAYOUT_MULTIPLIERS.TENS;
      else if (formValue.betType === 'THOUSANDS') multiplier = PAYOUT_MULTIPLIERS.THOUSANDS;

      let baseWager = amount;
      if (formValue.betMode === 'SURROUNDED') {
        baseWager = amount / 5;
      }

      this.potentialWinnings.set(baseWager * multiplier);
    });
  }

  setQuickValue(amount: number): void {
    this.betForm.patchValue({ wagerAmount: amount });
  }

  preventNegative(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e' || event.key === '+') {
      event.preventDefault();
    }
  }

  onSubmit(): void {
    if (this.betForm.invalid) {
      this.betForm.markAllAsTouched();
      this.toastService.show('Verifique os campos do formulário.', 'error');
      return;
    }

    const wager = this.betForm.value.wagerAmount;
    if (wager <= 0) {
      this.toastService.show('O valor da aposta não pode ser negativo ou zero.', 'error');
      return;
    }

    this.isLoading.set(true);
    this.betService.placeBet(this.betForm.value).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.toastService.show('Aposta realizada com sucesso!', 'success'); 
        this.loadWallet();
        this.betForm.patchValue({ betValue: '', wagerAmount: null });
        this.potentialWinnings.set(0);
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : 'Erro ao processar aposta.');
        this.toastService.show(msg, 'error');
        this.isLoading.set(false);
      }
    });
  }

  getErrorMessage(): string {
    const control = this.betForm.get('betValue');
    const type = this.betForm.get('betType')?.value;

    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Campo obrigatório!';
    
    if (type === 'GROUP' && (control.errors['min'] || control.errors['max'])) {
      return 'Escolha de 1 a 25!';
    }

    if (control.errors['pattern']) {
      return type === 'TENS' ? 'Digite 2 números!' : 'Digite 4 números!';
    }

    return 'Número inválido!';
  }

  /* ==========================================================================
     FUNÇÕES DE SIMULAÇÃO ARCADE (BOTÕES FÍSICOS)
     ========================================================================== */

  /** Botão Vermelho: Gera uma aposta completamente aleatória */
  playRandomBet(): void {
    const types: BetType[] = ['GROUP', 'TENS', 'THOUSANDS'];
    const modes = ['SIMPLE', 'SURROUNDED'];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    
    // CORREÇÃO: Variável apenas declarada, sem atribuição inútil.
    let randomValue: string;
    
    if (randomType === 'GROUP') {
      randomValue = Math.floor(Math.random() * 25 + 1).toString();
    } else if (randomType === 'TENS') {
      randomValue = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    } else {
      randomValue = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }

    this.betForm.patchValue({
      betType: randomType,
      betMode: randomMode,
      betValue: randomValue,
      wagerAmount: this.quickValues[Math.floor(Math.random() * this.quickValues.length)]
    });
    
    this.toastService.show('🎰 Jogada Aleatória Carregada!', 'success');
  }

  /** Botão Azul: Carrega uma aposta "Favorita" (Exemplo hardcoded) */
  playFavoritesBet(): void {
    this.betForm.patchValue({
      betType: 'GROUP',
      betMode: 'SIMPLE',
      betValue: '7', 
      wagerAmount: 20
    });
    this.toastService.show('⭐ Seus Favoritos Carregados!', 'success');
  }

  /** Botão Verde: Aposta Rápida em Grupo Cercado */
  quick5GroupBet(): void {
    this.betForm.patchValue({
      betType: 'GROUP',
      betMode: 'SURROUNDED',
      betValue: Math.floor(Math.random() * 25 + 1).toString(),
      wagerAmount: 10
    });
    this.toastService.show('🛡️ Grupo Cercado Gerado!', 'success');
  }

  /** Botão Amarelo: Aposta rápida em uma Dezena Aleatória */
  betOnTens(): void {
    this.betForm.patchValue({
      betType: 'TENS',
      betMode: 'SIMPLE',
      betValue: Math.floor(Math.random() * 100).toString().padStart(2, '0'),
      wagerAmount: 5
    });
    this.toastService.show('🎯 Dezena da Sorte Gerada!', 'success');
  }

  /** Botão Roxo: Aposta no clássico número da sorte (0777) */
  lucky7SeriesBet(): void {
    this.betForm.patchValue({
      betType: 'THOUSANDS',
      betMode: 'SIMPLE',
      betValue: '0777',
      wagerAmount: 7
    });
    this.toastService.show('🍀 Milhar Lucky 7 Carregada!', 'success');
  }
}