// src/app/components/comments-section/comments-section.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ArticleService } from '../services/article';
import { AuthService } from '../services/auth';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comments-section.html',
  // styleUrl: './comments-section.css'
})

export class CommentsSectionComponent implements OnInit, OnDestroy {
  @Input() articleId!: string; 
  comments: Comment[] = [];
  commentForm!: FormGroup;
  currentUser: User | null = null;
  isLoadingComments: boolean = true;
  commentErrorMessage: string | null = null;
  commentSuccessMessage: string | null = null;

  private authSubscription!: Subscription;

  commentsSectionTitle: string = 'Comentarios';
  noCommentsMessage: string = 'Sé el primero en comentar este artículo.';
  signInToCommentMessage: string = 'Inicia sesión para poder comentar.';
  yourCommentLabel: string = 'Tu comentario:';
  commentPlaceholder: string = 'Escribe tu comentario aquí...';
  postCommentButtonText: string = 'Publicar Comentario';
  commentSendingText: string = 'Enviando...';
  commentRequiredError: string = 'El comentario es obligatorio.';
  commentMinLengthError: string = 'El comentario debe tener al menos 5 caracteres.';
  commentMaxLengthError: string = 'El comentario no puede exceder los 500 caracteres.';
  commentSuccessAlert: string = '¡Comentario publicado con éxito!';
  commentErrorAlert: string = 'Error al publicar el comentario. Por favor, inténtalo de nuevo.';
  
  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    this.initCommentForm();
    if (this.articleId) {
      this.loadComments();
    } else {
      console.error('CommentsSectionComponent: articleId no proporcionado.');
      this.commentErrorMessage = 'No se puede cargar la sección de comentarios sin un ID de artículo.';
      this.isLoadingComments = false;
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  initCommentForm(): void {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]]
    });
  }

  loadComments(): void {
    this.isLoadingComments = true;
    this.commentErrorMessage = null;
    this.articleService.getCommentsForArticle(this.articleId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoadingComments = false;
      },
      error: (err) => {
        console.error('Error al cargar comentarios:', err);
        this.commentErrorMessage = 'Error al cargar los comentarios.';
        this.isLoadingComments = false;
      }
    });
  }

  onSubmitComment(): void {
    this.commentSuccessMessage = null;
    this.commentErrorMessage = null;

    if (this.commentForm.invalid) {
      this.markFormGroupTouched(this.commentForm);
      return;
    }

    if (!this.currentUser || !this.currentUser.id || !this.currentUser.username) {
      this.commentErrorMessage = 'Debes iniciar sesión para publicar un comentario.';
      return;
    }

    const newCommentContent: string = this.commentForm.get('content')?.value;
    const newComment: Partial<Comment> = {
      article_id: this.articleId,
      content: newCommentContent
    };

    this.isLoadingComments = true; 
    this.articleService.addComment(newComment).subscribe({
      next: (comment) => {
        this.comments.push({ ...comment, author_username: this.currentUser!.username }); 
        this.commentForm.reset(); 
        this.commentSuccessMessage = this.commentSuccessAlert;
        this.isLoadingComments = false;
        setTimeout(() => {
          this.commentSuccessMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Error al añadir comentario:', err);
        this.commentErrorMessage = this.commentErrorAlert;
        this.isLoadingComments = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  formatCommentDate(dateString: string | undefined): string {
    if (!dateString) {
      return 'Fecha desconocida';
    }
    const commentDate = new Date(dateString);
    if (isNaN(commentDate.getTime())) {
      return 'Fecha inválida';
    }
    return commentDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' ' + commentDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
  }
}
