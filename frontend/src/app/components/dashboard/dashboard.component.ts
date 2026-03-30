// app/components/dashboard/dashboard.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BetService, BetType } from '../../services/bet.service';
import { ToastService } from '../../services/toast.service';
import { UserService, UserProfile, WalletStats } from '../../services/user.service'; 
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private betService = inject(BetService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  animals = signal<any[]>([]);

  // --- LÓGICA DO MENU HAMBÚRGUER ---
  isMenuOpen = signal<boolean>(false); // Inicia fechado

  toggleMenu() {
    this.isMenuOpen.update(state => !state); // Inverte o estado (abre/fecha)
  }

  closeMenu() {
    this.isMenuOpen.set(false); // Força o fechamento ao clicar no link
  }
 
  // Gestão de Estado
  wallet = signal<WalletStats>({
    balance: 0, totalWon: 0, totalLost: 0, totalPending: 0, netProfit: 0, pendingBetsCount: 0
  });

  userName = signal<string>('');
  isLoading = signal<boolean>(false);

  // Formulário Reativo
  betForm!: FormGroup;

  // Opções de atalho para o valor da aposta 
  quickValues = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadWallet();
    this.loadAnimals();
    this.initForm();
    this.setupDynamicValidators();
  }

  private loadUserProfile(): void {
    this.userService.getMe().subscribe({
      next: (profile) => {
        this.userName.set(profile.username);
      },
      error: (err) => {
        this.toastService.show('Erro ao carregar dados do utilizador.', 'error');
      }
    });
  }

  private loadWallet(): void {
    this.userService.getWallet().subscribe({
      next: (stats) => this.wallet.set(stats),
      error: () => this.toastService.show('Erro ao carregar carteira.', 'error')
    });
  }

  loadAnimals(): void {
    this.http.get<any[]>('http://localhost:8080/api/animals').subscribe({
      next: (data) => this.animals.set(data),
      error: () => this.toastService.show('Erro ao carregar animais', 'error')
    });
  }

  logout(): void {
    this.closeMenu();
    // 1. Chama o serviço de autenticação para remover o Token do localStorage
    this.authService.logout(); 
    
    // 2. Feedback visual
    this.toastService.show('Sessão encerrada com sucesso!', 'success');
    
    // 3. Redireciona para a Home ou Login
    this.router.navigate(['/']); 
  }

  // Clicar no card preenche o formulário automaticamente
  selectAnimal(animal: any): void {
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
      wagerAmount: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  //Atualiza as regras de validação conforme o tipo de aposta escolhido
  private setupDynamicValidators(): void {
    this.betForm.get('betType')?.valueChanges.subscribe((type: BetType) => {
      const valueControl = this.betForm.get('betValue');
      valueControl?.clearValidators(); // Limpa as antigas

      if (type === 'GROUP') {
        valueControl?.setValidators([Validators.required, Validators.min(1), Validators.max(25)]);
      } else if (type === 'TENS') {
        valueControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{2}$/)]);
      } else if (type === 'THOUSANDS') {
        valueControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{4}$/)]);
      }
      
      valueControl?.updateValueAndValidity();
      valueControl?.setValue(''); // Reseta o valor digitado ao mudar o tipo
    });
  }

  // Método para os botões de atalho (R$ 5, R$ 10, etc.)
  setQuickValue(amount: number): void {
    this.betForm.patchValue({ wagerAmount: amount });
  }

  onSubmit(): void {
    if (this.betForm.invalid) {
      this.betForm.markAllAsTouched();
      this.toastService.show('Verifique os campos do formulário.', 'error');
      return;
    }

    this.isLoading.set(true);
    const formValue = this.betForm.value;

    this.betService.placeBet(formValue).subscribe({
      next: (response) => {
        this.toastService.show('Aposta realizada com sucesso!', 'success'); 
        
        this.loadWallet();

        this.betForm.patchValue({ betValue: '', wagerAmount: 0 }); // Reseta parcial
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : 'Erro ao processar aposta.');
        this.toastService.show(msg, 'error');

        this.isLoading.set(false);
      }
    });
  }
}