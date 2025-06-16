import { AfterViewInit, Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environments'; 

declare const grecaptcha: any;

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule 
  ],
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.css']
})
export class ContactoComponent implements OnInit, AfterViewInit { 

  @ViewChild('reCaptchaContainer') reCaptchaContainer!: ElementRef;

  contactForm!: FormGroup;
  recaptchaResponse: string | null = null;
  formSubmitted = false;
  isLoading = false;
  submitMessage: string | null = null;
  captchaRendered = false; 

  pageTitle: string = 'Contacto';
  introParagraph1: string = '¿Tienes alguna pregunta, sugerencia o quieres unirte a nuestro equipo? No dudes en contactar con nuestro equipo de administradores.';
  introParagraph2: string = 'Estamos aquí para ayudarte a resolver cualquier inquietud o para escuchar tus ideas.';
  introParagraph3: string = 'Tu opinión y tu análisis son muy valiosos para nosotros.';

  nameLabel: string = 'Nombre:';
  emailLabel: string = 'Email:';
  subjectLabel: string = 'Asunto:';
  messageLabel: string = 'Mensaje:';

  nameRequiredError: string = 'El nombre es obligatorio.';
  nameMinLengthError: string = 'El nombre debe tener al menos 2 caracteres.';
  
  emailRequiredError: string = 'El email es obligatorio.';
  emailInvalidError: string = 'El email no es válido.';

  subjectRequiredError: string = 'El asunto es obligatorio.';
  subjectMinLengthError: string = 'El asunto debe tener al menos 5 caracteres.';

  messageRequiredError: string = 'El mensaje es obligatorio.';
  messageMinLengthError: string = 'El mensaje debe tener al menos 10 caracteres.';

  captchaRequiredError: string = 'Por favor, completa el Captcha.';
  
  sendingButtonText: string = 'Enviando...';
  sendButtonText: string = 'Enviar Mensaje';

  submitSuccessMessage: string = '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.';
  submitErrorMessage: string = 'Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.';


  recaptchaSiteKey = environment.recaptchaSiteKey;

  private backendUrl = 'http://localhost:3000/api/contact';

  constructor(private fb: FormBuilder, private http: HttpClient, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      asunto: ['', [Validators.required, Validators.minLength(5)]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
    (window as any)['reCaptchaOnloadCallback'] = () => {
      this.renderRecaptcha();
    };
    (window as any)['reCaptchaVerifyCallback'] = (response: string) => {
      this.recaptchaResponse = response;
    };
    (window as any)['reCaptchaExpiredCallback'] = () => {
      this.recaptchaResponse = null;
    };
  }

  ngAfterViewInit(): void {
    if (typeof grecaptcha !== 'undefined' && grecaptcha.render && !this.captchaRendered) {
      this.renderRecaptcha();
    }
  }

  renderRecaptcha(): void {
    if (this.captchaRendered) {
      return; 
    }
    if (this.reCaptchaContainer && this.reCaptchaContainer.nativeElement && grecaptcha && grecaptcha.render) {
      grecaptcha.render(this.reCaptchaContainer.nativeElement, {
        'sitekey': this.recaptchaSiteKey,
        'callback': (response: string) => (window as any)['reCaptchaVerifyCallback'](response),
        'expired-callback': () => (window as any)['reCaptchaExpiredCallback'](),
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

  get f() { return this.contactForm.controls; }

  onSubmit(): void {
    this.formSubmitted = true;
    this.submitMessage = null;

    if (this.contactForm.invalid || !this.recaptchaResponse) {
      return;
    }

    this.isLoading = true;

    const formData = {
      ...this.contactForm.value,
      recaptchaToken: this.recaptchaResponse
    };

    this.http.post(this.backendUrl, formData).subscribe({
      next: (response) => {
        this.submitMessage = this.submitSuccessMessage;
        this.contactForm.reset();
        this.resetRecaptcha(); 
        this.formSubmitted = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.submitMessage = this.submitErrorMessage;
        this.isLoading = false;
        this.resetRecaptcha();
      }
    });
  }

  isSubmitDisabled(): boolean {
    return this.contactForm.invalid || !this.recaptchaResponse || this.isLoading;
  }
}
