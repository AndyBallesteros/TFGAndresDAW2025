import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-service.html',
  // styleUrl: './terms-service.css'
})
export class TermsOfServiceComponent {
  pageTitle: string = 'Términos de Servicio';
  lastUpdated: string = 'Última actualización: 16 de Junio de 2025';

  introductionTitle: string = 'Aceptación de los Términos';
  introductionParagraph: string = 'Bienvenido a Politólogos en Acción. Al acceder o utilizar nuestro sitio web y servicios, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de los términos, no debe utilizar nuestros servicios.';

  userObligationsTitle: string = 'Obligaciones del Usuario';
  userObligationsParagraph: string = 'Al utilizar nuestros servicios, usted se compromete a:';
  userObligationsListItem1: string = 'Proporcionar información precisa y completa al registrarse o enviar contenido.';
  userObligationsListItem2: string = 'No utilizar el sitio para fines ilegales o no autorizados.';
  userObligationsListItem3: string = 'No interferir con la seguridad del sitio o los servicios.';
  userObligationsListItem4: string = 'Respetar la propiedad intelectual de terceros.';
  userObligationsListItem5: string = 'Mantener la confidencialidad de su información de inicio de sesión.';

  contentSubmissionTitle: string = 'Contenido Generado por el Usuario';
  contentSubmissionParagraph1: string = 'Usted es responsable de cualquier contenido que envíe, publique o muestre en el sitio. Al enviar contenido, usted nos otorga una licencia mundial, no exclusiva, libre de regalías para usar, reproducir, modificar, adaptar, publicar, traducir, crear obras derivadas, distribuir y mostrar dicho contenido en relación con nuestros servicios.';
  contentSubmissionParagraph2: string = 'Usted garantiza que posee o tiene los derechos necesarios sobre el contenido que envía y que el contenido no infringe los derechos de ningún tercero.';

  intellectualPropertyTitle: string = 'Propiedad Intelectual';
  intellectualPropertyParagraph: string = 'Todo el contenido y los materiales disponibles en el sitio, incluyendo textos, gráficos, logotipos, imágenes y software, son propiedad de Politólogos en Acción o de sus licenciantes y están protegidos por leyes de derechos de autor y otras leyes de propiedad intelectual.';

  disclaimerOfWarrantiesTitle: string = 'Exclusión de Garantías';
  disclaimerOfWarrantiesParagraph: string = 'El sitio y sus servicios se proporcionan "tal cual" y "según disponibilidad", sin garantías de ningún tipo, ya sean expresas o implícitas. No garantizamos que el servicio será ininterrumpido, seguro o libre de errores.';

  limitationOfLiabilityTitle: string = 'Limitación de Responsabilidad';
  limitationOfLiabilityParagraph: string = 'En la medida máxima permitida por la ley, Politólogos en Acción no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo, incluyendo la pérdida de beneficios, datos, uso, fondo de comercio u otras pérdidas intangibles, resultantes de (i) su acceso o uso o incapacidad de acceso o uso del servicio; (ii) cualquier conducta o contenido de terceros en el servicio; (iii) cualquier contenido obtenido del servicio; y (iv) el acceso, uso o alteración no autorizados de sus transmisiones o contenido.';

  terminationTitle: string = 'Terminación';
  terminationParagraph: string = 'Podemos terminar o suspender su acceso a nuestros servicios inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluyendo, sin limitación, si usted incumple estos Términos de Servicio.';

  changesToTermsTitle: string = 'Cambios en los Términos de Servicio';
  changesToTermsParagraph: string = 'Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar al menos 30 días de aviso antes de que los nuevos términos entren en vigor. Lo que constituye un cambio material se determinará a nuestra entera discreción.';

  governingLawTitle: string = 'Ley Aplicable y Jurisdicción';
  governingLawParagraph: string = 'Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta sus disposiciones sobre conflicto de leyes. Cualquier disputa que surja de estos Términos se resolverá en los tribunales competentes de Murcia, España.';

  contactUsTitle: string = 'Contacto';
  contactUsParagraph: string = 'Si tiene alguna pregunta sobre estos Términos de Servicio, por favor, contáctenos:';
  contactUsEmail: string = 'enaccionpolitologos@gmail.com';
  
  disclaimerTitle: string = 'Aviso Legal Importante';
  disclaimerParagraph: string = 'Estos Términos de Servicio son una plantilla genérica. Para que sean legalmente vinculantes y cumplan con todas las leyes aplicables a tu jurisdicción y tipo de actividad, DEBES consultar a un profesional legal. Politólogos en Acción no se hace responsable del uso de esta plantilla sin la debida revisión legal.';

  constructor() { }
}