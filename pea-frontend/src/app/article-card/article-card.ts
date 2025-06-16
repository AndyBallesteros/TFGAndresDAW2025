import { Component, Input, OnInit } from '@angular/core';
import { Article } from '../models/article.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './article-card.html',
})
export class ArticleCardComponent implements OnInit {

  @Input() article!: Article;

  ngOnInit(): void {
    // if (typeof this.article.date === 'string') {
    //   this.article.date = new Date(this.article.date);
    // }
  }

  formatDate(date: Date): string {
    const articleDate = typeof date === 'string' ? new Date(date) : date;
    return articleDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}