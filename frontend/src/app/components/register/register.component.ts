import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth.service';
import { InfoModalComponent } from '../info-modal/info-modal.component';

/**
 * @class RegisterComponent
 * @description Componente de registo de utilizadores com layout responsivo side-by-side.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, InfoModalComponent], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  // Injeção de dependências para formulários, autenticação e navegação
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isModalOpen = signal(false);
  modalTitle = signal('');
  modalContent = signal('');

  // Definição das variáveis de controle do formulário e mensagens de status
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor() {
    // Inicializa o formulário reativo com as regras de validação
    this.registerForm = this.fb.group({
      name: ['', Validators.required], // Nome é obrigatório
      username: ['', Validators.required], // Usuário é obrigatório
      email: ['', [Validators.required, Validators.email]], // E-mail obrigatório e com formato válido
      password: ['', [Validators.required, Validators.minLength(6)]], // Senha obrigatória com no mínimo 6 caracteres
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
  
    } else if (type === 'privacidade') {
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

  // Função disparada ao submeter o formulário
  onSubmit(): void {
    // Verifica se todos os campos atendem às validações
    if (this.registerForm.valid) {
      this.isLoading = true;
      // Chama o serviço de registro passando os dados coletados
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          // Em caso de sucesso, exibe mensagem e redireciona após 2 segundos
          this.successMessage = 'Cadastro realizado! A redirecionar...';
          this.errorMessage = '';
          this.registerForm.reset();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          // Em caso de erro, define a mensagem de erro vinda do servidor ou uma padrão
          this.errorMessage = typeof err.error === 'string' ? err.error : 'Erro ao realizar o registo.';
          this.successMessage = '';
          this.isLoading = false;
        },
      });
    } else {
      // Se o formulário for inválido, marca todos os campos como tocados para exibir erros visuais
      this.registerForm.markAllAsTouched();
    }
  }
}