import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article'; 
import { Article } from '../../models/article.model'; 

@Component({
  selector: 'app-noticia',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './noticia.html',
  // styleUrl: './noticia.css'
})
export class NoticiaComponent implements OnInit {
  article: Article | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  loadingMessage: string = 'Cargando artículo...';
  notFoundMessage: string = 'Artículo no encontrado.';
  errorMessageDefault: string = 'Error al cargar el artículo. Por favor, inténtalo de nuevo más tarde.';
  byAuthorText: string = 'Por:';
  publishedOnText: string = 'Publicado el:';
  backToNewsButtonText: string = 'Volver a Noticias';

  constructor(
    private route: ActivatedRoute, 
    private router: Router,       
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const articleId = params.get('id');
      if (articleId) {
        this.loadArticle(articleId);
      } else {
        this.errorMessage = this.notFoundMessage;
        this.isLoading = false;
        console.error('ArticleDetailComponent: ID de artículo no proporcionado en la URL.');
      }
    });
  }

  loadArticle(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        if (article) {
          this.article = article;
          console.log('ArticleDetailComponent: Artículo cargado:', this.article);
        } else {
          this.errorMessage = this.notFoundMessage;
          console.warn('ArticleDetailComponent: Artículo no encontrado para ID:', id);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = this.errorMessageDefault;
        this.isLoading = false;
        console.error('ArticleDetailComponent: Error al cargar el artículo:', err);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return 'Fecha desconocida';
    }
    const articleDate = new Date(dateString);
    if (isNaN(articleDate.getTime())) {
      return 'Fecha inválida';
    }
    return articleDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}