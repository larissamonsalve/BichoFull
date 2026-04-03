import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InfoModalComponent } from '../info-modal/info-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, InfoModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  // Injeção de dependências para formulários, autenticação e rotas
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  isModalOpen = signal(false);
  modalTitle = signal('');
  modalContent = signal('');

  // Variáveis para o formulário e controle de mensagens de erro
  loginForm: FormGroup;
  errorMessage = '';

  constructor() {
    // Inicializa o formulário com campos obrigatórios
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  openInfo(type: string): void {
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
      this.modalTitle.set('Política de Privacidade');
      this.modalContent.set(`
      <p>Levamos sua segurança a sério:</p>
      <ul style="padding-left: 20px; color: #e2e8f0;">
        <li>Sua senha é protegida por criptografia no banco de dados.</li>
        <li>Não compartilhamos seus dados com terceiros.</li>
        <li>Recomendamos o uso de senhas fictícias para este teste.</li>
      </ul>
    `);    
    }
    this.isModalOpen.set(true);
  }

  // Função disparada ao clicar no botão de entrar
  onSubmit(): void {
    if (this.loginForm.valid) {
      // Chama o serviço de login passando os dados do formulário
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Em caso de sucesso, vai para o painel principal
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          // Em caso de erro, define a mensagem que será exibida na tela
          this.errorMessage = typeof err.error === 'string' 
            ? err.error 
            : 'Usuário ou senha inválidos.';
        },
      });
    } else {
      // Marca os campos para exibir erros visuais caso o formulário esteja incompleto
      this.loginForm.markAllAsTouched();
    }
  }
}