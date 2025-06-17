import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../../../environments/environments';

declare const grecaptcha: any;
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  // styleUrl: './register.css'
})
export class RegisterComponent implements OnInit, AfterViewInit {
  @ViewChild('reCaptchaContainer') reCaptchaContainer!: ElementRef;

  registerForm!: FormGroup;
  recaptchaResponse: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  captchaRendered = false;

  pageTitle: string = 'Regístrate';
  importantNoticeTitle: string = 'IMPORTANTE';
  importantNoticeParagraph1: string = 'Recuerda que registrarte no te permite enviar artículos. El derecho a compartir artículos está reservado a los colaboradores habituales de Politólogos en Acción, después de un exhaustivo escrutinio de la calidad de los análisis. Los usuarios registrados podrán acceder a su área personal y realizar comentarios en los artículos.';
  importantNoticeParagraph2: string = 'Una vez enviado el formulario, deberás confirmar tu correo electrónico para usar tu cuenta. En caso de ser colaborador y/o escritor, después un administrador te contactará para aprobar tu solicitud.';
  
  usernameLabel: string = 'Nombre de Usuario';
  emailLabel: string = 'Email';
  passwordLabel: string = 'Contraseña';
  registerButtonText: string = 'Registrarse';
  sendingButtonText: string = 'Registrando...';
  
  usernameRequiredError: string = 'El nombre de usuario es obligatorio.';
  usernameMinLengthError: string = 'El nombre de usuario debe tener al menos 3 caracteres.';
  usernameMaxLengthError: string = 'El nombre de usuario no puede exceder los 20 caracteres.';
  
  emailRequiredError: string = 'El correo electrónico es obligatorio.';
  emailInvalidError: string = 'Introduce un formato de correo electrónico válido.';
  
  passwordRequiredError: string = 'La contraseña es obligatoria.';
  passwordMinLengthError: string = 'La contraseña debe tener al menos 6 caracteres.';

  captchaRequiredError: string = 'Por favor, completa el Captcha.';
  
  alreadyHaveAccountText: string = '¿Ya tienes una cuenta?';
  loginLinkText: string = 'Inicia Sesión';
  
  registrationErrorMessage: string = 'Error en el registro. Inténtalo de nuevo.';
  
  recaptchaSiteKey = environment.recaptchaSiteKey;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    if (!(window as any).reCaptchaRenderQueue) {
      (window as any).reCaptchaRenderQueue = [];
    }
    (window as any).reCaptchaRenderQueue.push(() => this.renderRecaptcha());
  }

  ngAfterViewInit(): void {
    if (typeof grecaptcha !== 'undefined' && grecaptcha.render && !this.captchaRendered && (window as any).reCaptchaApiReady) {
      this.renderRecaptcha();
    }
  }

  onRecaptchaSuccess(response: string): void {
    this.recaptchaResponse = response;
    this.errorMessage = null;
  }

  onRecaptchaExpired(): void {
    this.recaptchaResponse = null;
  }
  renderRecaptcha(): void {
    if (this.captchaRendered) {
      return;
    }
    if (this.reCaptchaContainer && this.reCaptchaContainer.nativeElement && typeof grecaptcha !== 'undefined' && grecaptcha.render) {
      grecaptcha.render(this.reCaptchaContainer.nativeElement, {
        'sitekey': this.recaptchaSiteKey,
        'callback': (response: string) => this.onRecaptchaSuccess(response),
        'expired-callback': () => this.onRecaptchaExpired(),
        'theme': 'light'
      });
      this.captchaRendered = true;
    }
  }

  resetRecaptcha(): void {
    if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
      grecaptcha.reset();
      this.recaptchaResponse = null;
    }
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.errorMessage = null;
    this.markFormGroupTouched(this.registerForm);

    if (this.registerForm.invalid || !this.recaptchaResponse) {
      if (!this.recaptchaResponse) {
        this.errorMessage = this.captchaRequiredError;
      }
      return;
    }

    this.isLoading = true;

    const { username, email, password } = this.registerForm.value;
    this.authService.register(username, email, password).subscribe({
      next: (res) => {
        console.log('RegisterComponent: Registro exitoso en Supabase:', res);
        this.router.navigate(['/email-confirmation']);
        this.isLoading = false;
        this.resetRecaptcha();
      },
      error: (err) => {
        console.error('RegisterComponent: Error durante el registro en Supabase:', err);
        this.errorMessage = err.error.message || this.registrationErrorMessage;
        this.isLoading = false;
        this.resetRecaptcha();
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  isSubmitDisabled(): boolean {
    return this.registerForm.invalid || !this.recaptchaResponse || this.isLoading;
  }
}
