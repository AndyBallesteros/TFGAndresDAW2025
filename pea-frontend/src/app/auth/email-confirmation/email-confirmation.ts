import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './email-confirmation.html',
  // styleUrl: './email-confirmation.component.css'
})
export class EmailConfirmationComponent {
  mainTitle: string = '¡Casi listo! Confirma tu correo electrónico';
  confirmationMessage: string = 'Hemos enviado un correo electrónico de confirmación a la dirección que proporcionaste. Por favor, revisa tu bandeja de entrada (y tu carpeta de spam, por si acaso) y haz clic en el enlace para activar tu cuenta.';
  adminApprovalMessage: string = 'Una vez confirmado tu email y aceptado tu registro por parte de un administrador, podrás iniciar sesión. ¡Te esperamos pronto!';
  loginLinkText: string = 'Volver a la página de inicio de sesión';

  constructor() { }
}
