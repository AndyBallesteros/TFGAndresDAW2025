import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

  welcomeTitlePrefix: string = 'Bienvenido,';
  dashboardSubtitle: string = 'Desde aquí puedes gestionar tus artículos y enviar nuevos.';
  sendNewArticleButton: string = 'Mandar Nuevo Artículo';
  myArticlesSectionTitle: string = 'Mis Artículos';
  noArticlesMessage: string = 'Aún no has publicado ningún artículo.';
  noArticlesCallToAction: string = '¡Anímate a mandar el primero!';

  constructor(
    private authService: AuthService,
    private articleService: ArticleService
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
      }
    });
  }

  loadUserArticles(userId: string): void {
    this.articleService.getArticlesByAuthor(userId).subscribe({
      next: (articles) => {
        this.userArticles = articles;
      },
      error: (err) => {
        console.error('Error al cargar artículos del usuario:', err);
      }
    });
  }
}
