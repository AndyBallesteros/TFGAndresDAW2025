import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article';
import { Article } from '../../models/article.model';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-article.html',
  // styleUrl: './edit-article.component.css'
})
export class EditArticleComponent implements OnInit {
  articleId: string | null = null;
  newArticle: Article = {
    id: '',
    title: '',
    subtitle: '',
    content: '',
    imageUrl: '',
    created_at: '',
    author_id: '',
    author: ''
  };

  selectedFile: File | null = null;
  isUploadingImage: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  pageTitle: string = 'Editar Artículo';
  titleLabel: string = 'Título del Artículo';
  subtitleLabel: string = 'Subtítulo o Resumen';
  contentLabel: string = 'Contenido Completo';
  imageUploadLabel: string = 'Cambiar Imagen Principal (opcional)';
  fileSelectedText: string = 'Archivo seleccionado:';
  imageRequiredError: string = 'Por favor, selecciona una imagen para tu artículo.';
  titleRequiredError: string = 'El título es obligatorio.';
  titleMinLengthError: string = 'El título debe tener al menos 5 caracteres.';
  titleMaxLengthError: string = 'El título no puede exceder los 100 caracteres.';
  subtitleRequiredError: string = 'El subtítulo es obligatorio.';
  subtitleMinLengthError: string = 'El subtítulo debe tener al menos 10 caracteres.';
  subtitleMaxLengthError: string = 'El subtítulo no puede exceder los 250 caracteres.';
  contentRequiredError: string = 'El contenido es obligatorio.';
  contentMinLengthError: string = 'El contenido debe tener al menos 50 caracteres.';
  uploadingMessage: string = 'Subiendo imagen...';
  sendingButtonText: string = 'Guardando...';
  submitButtonText: string = 'Guardar Cambios';

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => {
        if (id) {
          this.articleId = id;
          this.isLoading = true;
          this.errorMessage = null;
          return this.articleService.getArticleById(id).pipe(
            catchError(err => {
              console.error('Error al cargar el artículo:', err);
              this.errorMessage = 'No se pudo cargar el artículo. Puede que no exista o no tengas permisos.';
              this.isLoading = false;
              return throwError(() => err);
            })
          );
        } else {
          this.errorMessage = 'ID de artículo no proporcionado.';
          this.isLoading = false;
          return of(null);
        }
      })
    ).subscribe(article => {
      if (article) {
        this.newArticle = { ...article };
        if (article.imageUrl) {
        } else {
          this.selectedFile = null;
        }
      }
      this.isLoading = false;
    });
  }

  private extractFileName(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = null;
    } else {
      this.selectedFile = null;
    }
  }

  removeCurrentImage(): void {
    this.newArticle.imageUrl = null;
    this.selectedFile = null;
    this.errorMessage = null;
    console.log('Imagen actual marcada para eliminación al guardar.');
  }

  isNewFileSelected(): boolean {
    if (!this.selectedFile) {
      return false;
    }
    if (!this.newArticle.imageUrl) {
      return true;
    }
    const currentFileName = this.extractFileName(this.newArticle.imageUrl);
    return !(this.selectedFile.name === currentFileName && this.selectedFile.size === 0 && this.selectedFile.type === 'image/jpeg');
  }
  async onSubmit(form: NgForm): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.errorMessage = 'Por favor, corrige los errores en el formulario.';
      return;
    }

    if (!this.selectedFile && !this.newArticle.imageUrl) {
      this.errorMessage = 'Debes seleccionar una imagen para el artículo o mantener la existente.';
      return;
    }

    this.isLoading = true;

    let imageUrlToSave: string | undefined | null = this.newArticle.imageUrl;

    if (this.selectedFile && this.isNewFileSelected()) {
      this.isUploadingImage = true;
      try {
        const path = `article_images/${Date.now()}_${this.selectedFile.name}`;
        const { data, error } = await this.articleService['supabase'].storage
          .from('article_images')
          .upload(path, this.selectedFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (error) {
          throw error;
        }

        const { data: publicUrlData } = this.articleService['supabase'].storage
          .from('article_images')
          .getPublicUrl(path);

        if (publicUrlData) {
          imageUrlToSave = publicUrlData.publicUrl;
        } else {
          throw new Error('No se pudo obtener la URL pública de la imagen.');
        }
      } catch (error: any) {
        console.error('Error al subir la imagen:', error);
        this.errorMessage = `Error al subir la imagen: ${error.message || 'Error desconocido'}`;
        this.isLoading = false;
        this.isUploadingImage = false;
        return;
      } finally {
        this.isUploadingImage = false;
      }
    } else if (this.newArticle.imageUrl === null && this.selectedFile === null) {
        imageUrlToSave = null;
    }

    if (!this.articleId) {
      this.errorMessage = 'No se encontró el ID del artículo para actualizar.';
      this.isLoading = false;
      return;
    }

    const articleToUpdate: Partial<Article> = {
      title: this.newArticle.title,
      subtitle: this.newArticle.subtitle,
      content: this.newArticle.content,
      imageUrl: imageUrlToSave
    };

    this.articleService.updateArticle(this.articleId, articleToUpdate).subscribe({
      next: (updatedArticle) => {
        this.successMessage = 'Artículo actualizado con éxito.';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al actualizar artículo:', err);
        this.errorMessage = `Error al actualizar el artículo: ${err.message || 'Error desconocido'}`;
        this.isLoading = false;
      }
    });
  }
}