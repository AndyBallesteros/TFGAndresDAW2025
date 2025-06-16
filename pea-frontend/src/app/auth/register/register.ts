import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  // styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  errorMessage: string | null = null;

  pageTitle: string = 'Regístrate';
  importantNoticeTitle: string = 'IMPORTANTE';
  importantNoticeParagraph1: string = 'Recuerda que registrarte no te da acceso directamente a tu área personal. El registro está reservado a los colaboradores habituales de Politólogos en Acción, después de un exhaustivo escrutinio de la calidad de los análisis.';
  importantNoticeParagraph2: string = 'Una vez enviado el formulario, deberás confirmar tu correo electrónico y después un administrador te contactará para aprobar tu solicitud.';
  
  usernameLabel: string = 'Nombre de Usuario';
  emailLabel: string = 'Email';
  passwordLabel: string = 'Contraseña';
  registerButtonText: string = 'Registrarse';
  
  usernameRequiredError: string = 'El nombre de usuario es obligatorio.';
  usernameMinLengthError: string = 'El nombre de usuario debe tener al menos 3 caracteres.';
  usernameMaxLengthError: string = 'El nombre de usuario no puede exceder los 20 caracteres.';
  
  emailRequiredError: string = 'El correo electrónico es obligatorio.';
  emailInvalidError: string = 'Introduce un formato de correo electrónico válido.';
  
  passwordRequiredError: string = 'La contraseña es obligatoria.';
  passwordMinLengthError: string = 'La contraseña debe tener al menos 6 caracteres.';

  alreadyHaveAccountText: string = '¿Ya tienes una cuenta?';
  loginLinkText: string = 'Inicia Sesión';
  
  registrationErrorMessage: string = 'Error en el registro. Inténtalo de nuevo.';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    console.log('1. onSubmit() llamado.');

    this.errorMessage = null;
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        console.log('2. Registro exitoso en Supabase:', res);
        this.router.navigate(['/email-confirmation']);
      },
      error: (err) => {
        console.error('3. Error durante el registro en Supabase:', err);
        this.errorMessage = err.error.message || this.registrationErrorMessage;
      }
    });
  }
}
