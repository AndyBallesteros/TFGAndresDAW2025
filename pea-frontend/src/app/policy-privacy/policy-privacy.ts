import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './policy-privacy.html',
  // styleUrl: './policy-privacy.css'
})
export class PrivacyPolicyComponent {
  pageTitle: string = 'Política de Privacidad';
  lastUpdated: string = 'Última actualización: 16 de Junio de 2025';
  
  introductionTitle: string = 'Introducción';
  introductionParagraph: string = 'En Politólogos en Acción, nos comprometemos a proteger la privacidad de nuestros usuarios. Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y protegemos su información personal cuando visita nuestro sitio web https://donweb.com/es-int/ y utiliza nuestros servicios.';
  
  informationCollectionTitle: string = 'Información que Recopilamos';
  infoCollectedParagraph1: string = 'Podemos recopilar información personal que usted nos proporciona directamente, como cuando se registra en el sitio, se suscribe a un boletín, envía un artículo o nos contacta. Esta información puede incluir:';
  infoCollectedListItem1: string = 'Nombre de usuario';
  infoCollectedListItem2: string = 'Dirección de correo electrónico';
  infoCollectedListItem3: string = 'Contraseña (cifrada)';
  infoCollectedListItem4: string = 'Cualquier otra información que decida proporcionarnos.';
  infoCollectedParagraph2: string = 'También podemos recopilar automáticamente cierta información sobre su dispositivo y su actividad de navegación, incluyendo su dirección IP, tipo de navegador, páginas visitadas, tiempo de visita y datos de uso del sitio a través de cookies y tecnologías similares. Consulte nuestra Política de Cookies para más detalles.';

  useOfInformationTitle: string = 'Uso de la Información';
  useOfInformationParagraph1: string = 'Utilizamos la información recopilada para los siguientes propósitos:';
  useOfInformationListItem1: string = 'Proveer y mantener nuestros servicios.';
  useOfInformationListItem2: string = 'Personalizar su experiencia en el sitio.';
  useOfInformationListItem3: string = 'Comunicarnos con usted sobre su cuenta, actualizaciones o servicios.';
  useOfInformationListItem4: string = 'Mejorar y desarrollar nuevos servicios y funcionalidades.';
  useOfInformationListItem5: string = 'Garantizar la seguridad de nuestro sitio y prevenir fraudes.';
  useOfInformationListItem6: string = 'Cumplir con nuestras obligaciones legales.';

  informationSharingTitle: string = 'Compartición de la Información';
  informationSharingParagraph1: string = 'No vendemos, comerciamos ni alquilamos su información personal a terceros. Podemos compartir su información en las siguientes situaciones:';
  informationSharingListItem1: string = 'Con proveedores de servicios que nos asisten en la operación de nuestro sitio y la prestación de servicios (por ejemplo, alojamiento, análisis de datos, servicio al cliente), siempre bajo acuerdos de confidencialidad.';
  informationSharingListItem2: string = 'En respuesta a un proceso legal o solicitud gubernamental.';
  informationSharingListItem3: string = 'Para proteger los derechos, la propiedad o la seguridad de Politólogos en Acción, nuestros usuarios o el público.';
  informationSharingListItem4: string = 'Con su consentimiento explícito.';

  yourRightsTitle: string = 'Sus Derechos de Protección de Datos';
  yourRightsParagraph: string = 'Usted tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, por favor, contáctenos a través de [tu_email_de_contacto].';
  
  securityMeasuresTitle: string = 'Medidas de Seguridad';
  securityMeasuresParagraph: string = 'Implementamos medidas de seguridad adecuadas para proteger su información personal contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Sin embargo, ninguna transmisión por internet o método de almacenamiento electrónico es 100% seguro.';

  changesToPolicyTitle: string = 'Cambios en esta Política de Privacidad';
  changesToPolicyParagraph: string = 'Podemos actualizar nuestra Política de Privacidad periódicamente. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "última actualización". Le recomendamos revisar esta Política de Privacidad periódicamente para cualquier cambio.';

  contactUsTitle: string = 'Contacto';
  contactUsParagraph: string = 'Si tiene alguna pregunta sobre esta Política de Privacidad, por favor, contáctenos:';
  contactUsEmail: string = 'enaccionpolitologos@gmail.com';
  
  disclaimerTitle: string = 'Aviso Legal Importante';
  disclaimerParagraph: string = 'Esta Política de Privacidad es una plantilla genérica. Para que sea legalmente vinculante y cumpla con todas las leyes aplicables a tu jurisdicción y tipo de actividad, DEBES consultar a un profesional legal. Politólogos en Acción no se hace responsable del uso de esta plantilla sin la debida revisión legal.';

  constructor() { }
}