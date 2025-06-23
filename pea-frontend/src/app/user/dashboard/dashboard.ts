import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User } from '../../models/user.model';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article';
import { ArticleCardComponent } from '../../article-card/article-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ArticleCardComponent],
  templateUrl: './dashboard.html',
  // styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userArticles: Article[] = [];
  isLoadingArticles: boolean= false;
  errorMessage: string | null=null;
  welcomeTitlePrefix: string = 'Bienvenido,';
  dashboardSubtitle: string = 'Desde aquí puedes gestionar tus artículos y enviar nuevos.';
  sendNewArticleButton: string = 'Mandar Nuevo Artículo';
  myArticlesSectionTitle: string = 'Mis Artículos';
  noArticlesMessage: string = 'Aún no has publicado ningún artículo.';
  noArticlesCallToAction: string = '¡Anímate a mandar el primero!';

  constructor(
    private authService: AuthService,
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser) {
        if (this.currentUser.id) {
          this.loadUserArticles(this.currentUser.id);
        }
      } else {
        this.userArticles = [];
        this.errorMessage= 'Debes iniciar sesión para ver tus artículos.';
      }
    });
  }

  loadUserArticles(userId: string): void {
    this.isLoadingArticles=true;
    this.errorMessage=null;
    this.articleService.getArticlesByAuthor(userId).subscribe({
      next: (articles) => {
        this.userArticles = articles;
        this.isLoadingArticles=false;
      },
      error: (err) => {
        console.error('Error al cargar artículos del usuario:', err);
        this.errorMessage = 'No se pudieron cargar tus artículos. Inténtalo de nuevo más tarde.';
        this.isLoadingArticles = false; 

      }
    });
  }
  editArticle(articleId: string): void {
    this.router.navigate(['/edit-article', articleId]);
  }

  confirmDelete(articleId: string, articleTitle: string): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el artículo "${articleTitle}"? Esta acción es irreversible.`)) {
      this.deleteArticle(articleId);
    }
  }

  deleteArticle(articleId: string): void {
    this.isLoadingArticles = true; 
    this.errorMessage = null;

    this.articleService.deleteArticle(articleId).subscribe({
      next: () => {
        console.log('Artículo eliminado con éxito:', articleId);
        if (this.currentUser?.id) {
          this.loadUserArticles(this.currentUser.id);
        }
      },
      error: (err) => {
        console.error('Error al eliminar artículo:', err);
        this.errorMessage = `Error al eliminar el artículo: ${err.message || 'Error desconocido'}. Asegúrate de que tienes permisos.`;
        this.isLoadingArticles = false;
      }
    });
  }
}
