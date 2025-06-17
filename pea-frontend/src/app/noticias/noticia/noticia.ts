// src/app/noticias/noticia/noticia.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article';
import { Article } from '../../models/article.model';
import { CommentsSectionComponent } from '../../comments-section/comments-section'; 

@Component({
  selector: 'app-noticia',
  standalone: true,
  imports: [CommonModule, RouterModule, CommentsSectionComponent],
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
  unknownAuthorFallback: string = 'Autor Desconocido';
  unknownDateFallback: string = 'Fecha desconocida';
  invalidDateFallback: string = 'Fecha inválida';

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
        console.error('NoticiaComponent: ID de artículo no proporcionado en la URL.');
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
          console.log('NoticiaComponent: Artículo cargado:', this.article);
        } else {
          this.errorMessage = this.notFoundMessage;
          console.warn('NoticiaComponent: Artículo no encontrado para ID:', id);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = this.errorMessageDefault;
        this.isLoading = false;
        console.error('NoticiaComponent: Error al cargar el artículo:', err);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return this.unknownDateFallback;
    }
    const articleDate = new Date(dateString);
    if (isNaN(articleDate.getTime())) {
      return this.invalidDateFallback;
    }
    return articleDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
