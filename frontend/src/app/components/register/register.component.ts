import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth.service';

/**
 * @class RegisterComponent
 * @description Componente responsável por criar novas contas de utilizador.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** @description Formulário reativo de registo */
  registerForm: FormGroup;
  /** @description Mensagem de erro retornada pela API */
  errorMessage = '';
  /** @description Mensagem de sucesso ao concluir o registo */
  successMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * @description Processa o formulário de registo e interage com o AuthService.
   * Se a conta for criada com sucesso, aguarda 2 segundos e envia para o Login.
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.successMessage = 'Cadastro realizado! A redirecionar...';
          this.errorMessage = '';
          this.registerForm.reset();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = typeof err.error === 'string' 
            ? err.error 
            : 'Erro ao realizar o registo.';
          this.successMessage = '';
        },
      });
    }
  }
}