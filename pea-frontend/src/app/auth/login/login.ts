import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  // styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  pageTitle: string = 'Iniciar Sesión';
  emailLabel: string = 'Email';
  passwordLabel: string = 'Contraseña';
  loginButtonText: string = 'Iniciar Sesión';
  noAccountText: string = '¿No tienes una cuenta?';
  registerLinkText: string = 'Regístrate aquí';
  emptyFieldsError: string = 'Por favor, introduce tu email y contraseña.';
  loginSuccessMessage: string = '¡Inicio de sesión exitoso. Bienvenido de nuevo!';
  loginErrorMessageDefault: string = 'Error en el inicio de sesión. Credenciales inválidas o problema de red.';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    console.log('LoginComponent: 1. onSubmit() llamado. Intentando iniciar sesión con email:', this.email);

    this.errorMessage = null;
    this.successMessage = null;

    if (!this.email || !this.password) {
      this.errorMessage = this.emptyFieldsError;
      console.error('LoginComponent: Email o contraseña vacíos.');
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('LoginComponent: 2. Inicio de sesión exitoso en Supabase:', res);
        this.successMessage = this.loginSuccessMessage;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('LoginComponent: 3. Error durante el inicio de sesión en Supabase:', err);
        if (err && err.message) {
          this.errorMessage = err.message;
        } else if (err && err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = this.loginErrorMessageDefault;
        }
      }
    });
  }
}
