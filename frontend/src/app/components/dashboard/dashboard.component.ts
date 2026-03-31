import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BetService, BetType } from '../../services/bet.service';
import { ToastService } from '../../services/toast.service';
import { UserService, WalletStats } from '../../services/user.service'; 
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

interface Animal {
  name: string;
  groupNumber: number;
  imagePath: string;
  tens: number[];
}

/**
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
  // Injeção de dependências via inject() - Padrão Angular Moderno
  private fb = inject(FormBuilder);
  private betService = inject(BetService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Estados Reativos (Signals) para alta performance de UI
  animals = signal<Animal[]>([]);
  wallet = signal<WalletStats>({
    balance: 0, totalWon: 0, totalLost: 0, totalPending: 0, netProfit: 0, pendingBetsCount: 0
  });
  userName = signal<string>('');
  isLoading = signal<boolean>(false);

  betForm!: FormGroup;
  quickValues = [5, 10, 20, 50];

  /** @lifecycle Inicializa os dados essenciais do Dashboard */
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadWallet();
    this.loadAnimals();
    this.initForm();
    this.setupDynamicValidators();
  }

  /** @description Carrega os dados básicos do perfil do usuário */
  private loadUserProfile(): void {
    this.userService.getMe().subscribe({
      next: (profile) => this.userName.set(profile.username),
      error: () => this.toastService.show('Erro ao carregar dados do utilizador.', 'error')
    });
  }

  /** @description Sincroniza os valores da carteira e estatísticas de lucro */
  private loadWallet(): void {
    this.userService.getWallet().subscribe({
      next: (stats) => this.wallet.set(stats),
      error: () => this.toastService.show('Erro ao carregar carteira.', 'error')
    });
  }

  /** @description Busca a lista de animais configurada no servidor */
  private loadAnimals(): void {
    this.http.get<Animal[]>('http://localhost:8080/api/animals').subscribe({
      next: (data) => this.animals.set(data),
      error: () => this.toastService.show('Erro ao carregar animais', 'error')
    });
  }

  /** @description Finaliza a sessão do usuário e limpa o estado local */
  logout(): void {
    this.authService.logout(); 
    this.toastService.show('Sessão encerrada com sucesso!', 'success');
    this.router.navigate(['/']); 
  }

  /** * @description Seleciona um animal na grid e preenche o formulário automaticamente.
   * @param animal Objeto contendo nome e número do grupo.
   */
  selectAnimal(animal: { name: string, groupNumber: number }): void {
    this.betForm.patchValue({
      betType: 'GROUP',
      betValue: animal.groupNumber.toString()
    });
    this.toastService.show(`${animal.name} selecionado!`, 'success');
  }

  /** @description Inicializa a estrutura do formulário com valores padrão */
  private initForm(): void {
    this.betForm = this.fb.group({
      betType: ['GROUP', Validators.required],
      betMode: ['SIMPLE', Validators.required],
      betValue: ['', [Validators.required, Validators.min(1), Validators.max(25)]],
      wagerAmount: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  /** * @description Gerencia a troca de validadores conforme o tipo de aposta selecionada.
   * Garante que o usuário digite a quantidade correta de números para Dezenas ou Milhares.
   */
  private setupDynamicValidators(): void {
    this.betForm.get('betType')?.valueChanges.subscribe((type: BetType) => {
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

  /** * @description Atalho para definir rapidamente o valor da aposta.
   * @param amount Valor monetário em R$.
   */
  setQuickValue(amount: number): void {
    this.betForm.patchValue({ wagerAmount: amount });
  }

  /** * @description Processa a submissão da aposta. 
   * Valida o saldo e atualiza a carteira em caso de sucesso.
   */
  onSubmit(): void {
    if (this.betForm.invalid) {
      this.betForm.markAllAsTouched();
      this.toastService.show('Verifique os campos do formulário.', 'error');
      return;
    }

    this.isLoading.set(true);
    this.betService.placeBet(this.betForm.value).subscribe({
      next: () => {
        this.toastService.show('Aposta realizada com sucesso!', 'success'); 
        this.loadWallet();
        this.betForm.patchValue({ betValue: '', wagerAmount: 0 });
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err.error?.message || 'Erro ao processar aposta.';
        this.toastService.show(msg, 'error');
        this.isLoading.set(false);
      }
    });
  }

  /** * @description Centraliza a lógica de tratamento de mensagens de erro do formulário.
   * @returns String formatada com a instrução de correção para o usuário.
   */
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
}