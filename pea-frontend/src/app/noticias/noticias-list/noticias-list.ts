import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article';
import { Article } from '../../models/article.model';
import { ArticleCardComponent } from '../../article-card/article-card';

@Component({
  selector: 'app-noticias-list',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './noticias-list.html',
  // styleUrl: './noticias-list.component.css'
})
export class NoticiasListComponent implements OnInit {
  articles: Article[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  headerTitle: string = 'Últimos Artículos';
  headerSubtitle: string = 'Explora los análisis y artículos más recientes';
  articlesSectionTitle: string = 'Artículos Recientes';
  loadingMessage: string = 'Cargando noticias...';
  articlesErrorMessage: string = 'Error al cargar las noticias. Por favor, inténtalo de nuevo más tarde.';
  noArticlesMessage: string = 'No hay noticias disponibles en este momento.';
  noArticlesCallToAction: string = '¡Sé el primero en publicar una!';
  footerText: string = 'Portal de Divulgación Científica. Todos los derechos reservados.';

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.articleService.getArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = this.articlesErrorMessage;
        this.isLoading = false;
        console.error('Error fetching articles:', err);
      }
    });
  }
}
