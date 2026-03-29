import { Component, inject } from '@angular/core';
// Necessário para *ngIf
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; // 1. Importar o Router

@Component({
  selector: 'app-register',
  standalone: true, // <--- Adicione isso
  imports: [ReactiveFormsModule], // <--- Adicione isso
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.successMessage = 'Cadastro realizado com sucesso! Redirecionando para o login...';
          this.errorMessage = '';
          this.registerForm.reset();

          // 4. Aguardar 2 segundos (2000 ms) e redirecionar para a tela de login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = err.error || 'Erro ao realizar cadastro. Tente novamente.';
          this.successMessage = '';
        },
      });
    }
  }
}
