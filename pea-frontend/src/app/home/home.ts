import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Article } from '../models/article.model';
import { ArticleService } from '../services/article';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './home.html',
  // styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  heroTitle: string = 'Politólogos en Acción: Una Fuente para el Análisis Político Riguroso';
  heroSubtitle: string = 'Un portal dedicado a la discusión informada y profunda de la ciencia política y las relaciones internacionales.';
  heroCtaJoin: string = 'Únete a la Comunidad';
  heroCtaExplore: string = 'Explora Artículos';

  aboutUsTitle: string = '¿Quiénes Somos y Qué Hacemos?';
  aboutUsIntro: string = 'En Politólogos en Acción, creemos que una comprensión profunda de la política es esencial para la ciudadanía activa y el progreso social. Somos un colectivo de entusiastas de la ciencia política dedicados a:';
  
  features = [
    {
      title: 'Promover el Análisis Riguroso',
      description: 'Publicamos artículos, ensayos y reportajes basados en el análisis politológico y sociológico, lejos de la superficialidad mediática.',
      icon: 'book' 
    },
    {
      title: 'Valorar las Ramas Académicas',
      description: 'Desde el análisis de política exterior hasta artículos sobre comportamiento político o electoral, nuestros colaboradores garantizan una perspectiva que respeta la actualidad académica en cada rama.',
      icon: 'globe' 
    },
    {
      title: 'Fomentar la Comunidad Activa',
      description: 'Un espacio para el debate constructivo entre académicos, estudiantes y ciudadanos interesados en la política. ¡Comenta en nuestros artículos!',
      icon: 'users'
    }
  ];

  articlesSectionTitle: string = 'Últimos Artículos Publicados';

  ctaFooterTitle: string = '¿Te interesa el análisis político?';
  ctaFooterSubtitle: string = 'Únete a nuestra comunidad para acceder a contenido exclusivo, participar en debates y contribuir con tus propias ideas.';
  ctaFooterButton: string = '¡Regístrate Hoy Mismo!';

  footerText: string = 'Politólogos en Acción. Todos los derechos reservados.';

  noticiaDestacada: Article | null = null;
  entradasRecientes: Article[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private articleService: ArticleService) { }

  ngOnInit(): void {
    this.loadRecentArticles();
  }

  loadRecentArticles(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.articleService.getRecentArticles(4).pipe( 
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (articles: Article[]) => {
        if (articles && articles.length > 0) {
          this.noticiaDestacada = articles[0];
          this.entradasRecientes = articles.slice(1, 4);
        } else {
          this.errorMessage = 'No se encontraron artículos.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los artículos. Por favor, inténtalo de nuevo más tarde.';
      },
      complete: () => {
      }
    });
  }

  get shouldShowFeaturedArticleSeparately(): boolean {
    if (!this.noticiaDestacada) {
      return false;
    }
    const isFeaturedInRecents = this.entradasRecientes.some(a => a.id === this.noticiaDestacada!.id);
    return !isFeaturedInRecents || this.entradasRecientes.length === 0;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return 'Fecha desconocida';
    }
    const articleDate = new Date(dateString);
    return articleDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
