import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

/**
 * @class LoginComponent
 * @description Componente responsável pela autenticação do utilizador no sistema.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** @description Formulário reativo de login */
  loginForm: FormGroup;
  /** @description Mensagem de erro a ser exibida na interface (se existir) */
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  /**
   * @description Submete os dados de autenticação para a API.
   * Em caso de sucesso, redireciona o utilizador para o Dashboard.
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = typeof err.error === 'string' 
            ? err.error 
            : 'Utilizador ou senha inválidos.';
        },
      });
    }
  }
}