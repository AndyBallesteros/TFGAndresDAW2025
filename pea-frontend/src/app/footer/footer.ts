import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  // styleUrl: './footer.css'
})
export class FooterComponent {
  copyrightYear: number = new Date().getFullYear();
  footerText: string = 'Politólogos en Acción. Todos los derechos reservados.';

  privacyPolicyLinkText: string = 'Política de Privacidad';
  privacyPolicyPath: string = '/politica-privacidad';

  termsOfServiceLinkText: string = 'Términos de Servicio';
  termsOfServicePath: string = '/terminos-servicio';
  
  constructor() { }
}
