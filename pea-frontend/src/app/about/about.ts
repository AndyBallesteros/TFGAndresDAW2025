import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './about.html',
  // styleUrl: './about.component.css'
})
export class AboutComponent {
  headerTitle: string = 'Sobre Politólogos en Acción';
  headerSubtitle: string = 'En defensa de la labor del politólogo';

  whoAreWeTitle: string = '¿Quiénes Somos?';
  whoAreWeIntro: string = 'Somos un grupo de jóvenes politólogos cansados de soportar comentarios que denigran nuestra profesión. Cansados de ver cómo multitud de áreas académicas copan los espacios de análisis en medios de comunicación y redes sociales. Y cansados de ver cómo la falta de profesionalización lastra la gestión pública.';
  teamDescription: string = '"Encontrar politólogos realmente independientes es como tener un extintor en casa. A la hora de la verdad, marca la diferencia"';
  teamQuote: string='-- El equipo de Politólogos en Acción';
  teamImageAlt: string = 'Equipo de trabajo';

  socialMediaTitle: string = 'Síguenos en Redes Sociales';
  socialMediaSubtitle: string = 'Conéctate con nosotros para mantenerte al día con los últimos análisis y debates. ¡Tu participación en la conversación política es clave!';
  socialMediaLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=100092906103894',
      icon: 'facebook'
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/PolitologosA',
      icon: 'twitter'
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@politologosenaccion',
      icon: 'tiktok'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/politologosenaccion/',
      icon: 'instagram'
    }
  ];
  ourGoalTitle: string = 'Nuestro objetivo';
  ourGoalParagraph1: string = 'En Politólogos en Acción creemos firmemente que la ciencia política debe tener un hueco destacado en los espacios públicos de análisis. Nuestra misión es aportar nuestro enfoque sobre el estado de la academia en uno de los campos sociales más denostados e incomprendidos, haciendo que los descubrimientos más recientes y los conceptos más complejos sean accesibles y comprensibles para todos, desde estudiantes curiosos hasta profesionales ávidos de nuevas ideas.';
  ourGoalParagraph2: string = 'Nos esforzamos por ser la fuente de referencia donde la curiosidad se encuentra con la claridad y la neutralidad. Publicamos artículos, noticias y análisis desde el punto de vista del politólogo, siempre con el rigor que la ciencia exige, pero con la sencillez que la divulgación merece.';

  joinConversationTitle: string = 'Únete a la Conversación';
  joinConversationParagraph1: string = 'Más que un portal, somos una comunidad. Te invitamos a explorar, aprender y participar. Tus comentarios, preguntas y contribuciones son el motor que impulsa nuestro crecimiento. Si eres un investigador, un divulgador o simplemente un apasionado de la ciencia política, ¡este es tu espacio!';
  joinConversationParagraph2: string = 'Si quieres participar, puedes mandarnos una petición para que te demos de alta como colaborador. Nuestra política da rienda suelta al análisis centrado con temática totalmente abierta, siempre y cuando tenga un nivel de neutralidad y aseptismo adecuado. Para ser dado de alta, el solicitante deberá pasar un escrutinio a fin de calificar estas valoraciones.';
  joinCtaButtonText: string = '¡Regístrate Hoy!';
  constructor() { }
}
