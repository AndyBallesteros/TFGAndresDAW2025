import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../services/article';
import { Router } from '@angular/router';
import { Article } from '../../models/article.model';
import { getSupabaseClient } from '../../supabase.config';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-submit-article',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit-article.html',
  // styleUrl: './submit-article.component.css'
})
export class SubmitArticleComponent {
  newArticle: Article = {
    title: '',
    subtitle: '',
    content: '',
    imageUrl: ''
  };
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  pageTitle: string = 'Enviar Nuevo Artículo';
  titleLabel: string = 'Título del Artículo';
  subtitleLabel: string = 'Subtítulo';
  contentLabel: string = 'Cuerpo del Artículo';
  imageUploadLabel: string = 'Subir Imagen del Artículo';
  
  titleRequiredError: string = 'El título es obligatorio.';
  titleMinLengthError: string = 'El título debe tener al menos 5 caracteres.';
  titleMaxLengthError: string = 'El título no puede exceder los 100 caracteres.';
  
  subtitleRequiredError: string = 'El subtítulo es obligatorio.';
  subtitleMinLengthError: string = 'El subtítulo debe tener al menos 10 caracteres.';
  subtitleMaxLengthError: string = 'El subtítulo no puede exceder los 250 caracteres.';
  
  contentRequiredError: string = 'El contenido del artículo es obligatorio.';
  contentMinLengthError: string = 'El contenido debe tener al menos 50 caracteres.';
  
  imageRequiredError: string = 'Una imagen es obligatoria para el artículo.';
  
  formInvalidError: string = 'Por favor, completa todos los campos requeridos correctamente.';
  noFileSelectedError: string = 'Por favor, selecciona una imagen para el artículo.';
  fileSelectedText: string = 'Archivo seleccionado:';
  
  uploadingMessage: string = 'Subiendo imagen y enviando artículo...';
  sendingButtonText: string = 'Enviando...';
  submitButtonText: string = 'Enviar Artículo';
  
  submitSuccessMessage: string = 'Artículo y imagen enviados con éxito!';
  submitErrorDbMessage: string = 'Error al enviar el artículo. Asegúrate de estar logueado y tener permisos.';
  uploadErrorPrefix: string = 'Error al subir la imagen:';
  unknownError: string = 'Error desconocido al subir la imagen o procesar el artículo.';
  storageErrorPrefix: string = 'Error de Storage:';


  private supabase: SupabaseClient;

  constructor(private articleService: ArticleService, private router: Router) {
    this.supabase = getSupabaseClient();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = null;
      console.log('SubmitArticleComponent: Archivo seleccionado:', this.selectedFile.name, 'Tipo:', this.selectedFile.type);
    } else {
      this.selectedFile = null;
      console.log('SubmitArticleComponent: No se seleccionó ningún archivo.');
    }
  }

  async onSubmit(form: NgForm): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    if (form.invalid) {
      this.errorMessage = this.formInvalidError;
      console.error('SubmitArticleComponent: Formulario inválido.');
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = this.noFileSelectedError;
      console.error('SubmitArticleComponent: No se ha seleccionado ningún archivo de imagen.');
      return;
    }

    this.isLoading = true;
    console.log('SubmitArticleComponent: Iniciando proceso de envío de artículo y imagen.');

    try {
      const sanitizedTitle = this.newArticle.title
        .replace(/\s+/g, '-') 
        .replace(/[^a-zA-Z0-9-]/g, '') 
        .toLowerCase();
      
      const fileExtension = this.selectedFile.name.split('.').pop();
      const filePath = `public/${sanitizedTitle}-${Date.now()}.${fileExtension}`;
      
      console.log('SubmitArticleComponent: Intentando subir imagen con filePath sanitizado:', filePath, 'al bucket "article-images".');

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('article-images') 
        .upload(filePath, this.selectedFile, {
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        console.error('SubmitArticleComponent: ERROR al subir la imagen a Storage:', JSON.stringify(uploadError, null, 2));
        throw uploadError; 
      }

      console.log('SubmitArticleComponent: Imagen subida a Storage exitosamente:', uploadData);

      const { data: publicUrlData } = this.supabase.storage
        .from('article-images')
        .getPublicUrl(filePath); 

      if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error('No se pudo obtener la URL pública de la imagen después de la subida.');
      }
      console.log('SubmitArticleComponent: URL pública de la imagen obtenida:', publicUrlData.publicUrl);
      this.newArticle.imageUrl = publicUrlData.publicUrl;

      this.articleService.createArticle(this.newArticle).subscribe({
        next: (article) => {
          this.successMessage = this.submitSuccessMessage;
          this.isLoading = false;
          form.resetForm(); 
          this.newArticle = { title: '', subtitle: '', content: '', imageUrl: '' };
          this.selectedFile = null;

          console.log('SubmitArticleComponent: Artículo enviado con éxito. Redirigiendo...');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('SubmitArticleComponent: Error al enviar el artículo a la DB:', err);
          this.errorMessage = err.message || this.submitErrorDbMessage;
        }
      });

    } catch (error: any) {
      this.isLoading = false;
      console.error('SubmitArticleComponent: Error capturado en el try-catch general:', error);
      this.errorMessage = error.message || this.unknownError;
      if (error && error.message) {
        this.errorMessage = `${this.uploadErrorPrefix} ${error.message}`;
      } else if (error && error.name === 'StorageError') {
        this.errorMessage = `${this.storageErrorPrefix} ${error.message || this.unknownError}`;
      }
    }
  }
}
