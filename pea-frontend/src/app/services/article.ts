import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError, tap, take } from 'rxjs/operators';
import { Article } from '../models/article.model';
import { Comment } from '../models/comment.model';
import { getSupabaseClient } from '../supabase.config';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = getSupabaseClient();
  }

  private mapSupabaseArticleToModel(item: any): Article {
    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      content: item.content,
      imageUrl: item.image_url,
      created_at: item.created_at,
      user_id: item.author_id,
      author: item.users ? item.users.username : (item.author_name || 'Autor Desconocido')
    } as Article;
  }

  getArticles(): Observable<Article[]> {
    return from(
      this.supabase
        .from('articles')
        .select(`
          id,
          title,
          subtitle,
          content,
          image_url,
          created_at,
          author_id,
          users!articles_author_id_fkey (username)
        `)
        .order('created_at', { ascending: false })
    ).pipe(
      tap(response => console.log('ArticleService: getArticles - Respuesta de Supabase:', response)),
      map(response => {
        if (response.error) {
          console.error('ArticleService: Error al obtener artículos:', response.error);
          throw response.error;
        }
        return response.data.map((item: any) => this.mapSupabaseArticleToModel(item));
      }),
      catchError(error => {
        console.error('ArticleService: Error atrapado en getArticles:', error);
        return throwError(() => error);
      })
    );
  }

  getArticleById(id: string): Observable<Article> {
    return from(
      this.supabase
        .from('articles')
        .select(`
          id,
          title,
          subtitle,
          content,
          image_url,
          created_at,
          author_id,
          users!articles_author_id_fkey (username)
        `)
        .eq('id', id)
        .single()
    ).pipe(
      tap(response => console.log('ArticleService: getArticleById - Respuesta de Supabase:', response)),
      map(response => {
        if (response.error) {
          console.error('ArticleService: Error al obtener artículo por ID:', response.error);
          throw response.error;
        }
        if (!response.data) {
          throw new Error('Artículo no encontrado');
        }
        return this.mapSupabaseArticleToModel(response.data);
      }),
      catchError(error => {
        console.error('ArticleService: Error atrapado en getArticleById:', error);
        return throwError(() => error);
      })
    );
  }

  getArticlesByAuthor(authorId: string): Observable<Article[]> {
    console.log('ArticleService: Llamada a getArticlesByAuthor() para authorId:', authorId);
    return from(
      this.supabase
        .from('articles')
        .select(`
          id,
          title,
          subtitle,
          content,
          image_url,
          created_at,
          author_id,
          users!articles_author_id_fkey (username)
        `)
        .eq('author_id', authorId)
        .order('created_at', { ascending: false })
    ).pipe(
      tap(response => console.log('ArticleService: getArticlesByAuthor - Respuesta de Supabase:', response)),
      map(response => {
        if (response.error) {
          console.error('ArticleService: Error al obtener artículos por autor:', response.error);
          throw response.error;
        }
        return response.data.map((item: any) => this.mapSupabaseArticleToModel(item));
      }),
      catchError(error => {
        console.error('ArticleService: Error atrapado en getArticlesByAuthor:', error);
        return throwError(() => error);
      })
    );
  }

  createArticle(article: Article): Observable<Article> {
    const currentUserPromise = this.supabase.auth.getUser();

    return from(currentUserPromise).pipe(
      switchMap(async ({ data, error }) => {
        if (error || !data.user) {
          console.error('ArticleService: Error al obtener usuario autenticado para crear artículo:', error);
          throw new Error('Usuario no autenticado para crear artículo.');
        }

        const username = data.user.user_metadata?.['username'] || data.user.email;
        console.log('ArticleService: Creando artículo para author_id:', data.user.id, 'y author_name:', username);

        const newArticleData = {
          title: article.title,
          subtitle: article.subtitle,
          content: article.content,
          image_url: article.imageUrl,
          author_id: data.user.id,
          author_name: username
        };

        const { data: insertedData, error: insertError } = await this.supabase
          .from('articles')
          .insert([newArticleData])
          .select(`
            id,
            title,
            subtitle,
            content,
            image_url,
            created_at,
            author_id,
            users!articles_author_id_fkey (username)
          `)
          .single();

        if (insertError) {
          console.error('ArticleService: Error al insertar el artículo en la base de datos:', insertError);
          throw insertError;
        }

        console.log('ArticleService: Artículo insertado con éxito:', insertedData);
        return this.mapSupabaseArticleToModel(insertedData);
      }),
      catchError(error => {
        console.error('ArticleService: Error atrapado en createArticle:', error);
        return throwError(() => error);
      })
    );
  }

  getRecentArticles(limit: number = 4): Observable<Article[]> {
    return from(
      this.supabase
        .from('articles')
        .select(`
          id,
          title,
          subtitle,
          content,
          image_url,
          created_at,
          author_id,
          users!articles_author_id_fkey (username)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
    ).pipe(
      tap(response => console.log('ArticleService: getRecentArticles - Respuesta cruda de Supabase:', response)),
      map(response => {
        if (response.error) {
          console.error('ArticleService: Error al obtener artículos recientes:', response.error);
          throw response.error;
        }
        console.log('ArticleService: Artículos recientes recibidos de Supabase (data):', response.data);
        return response.data.map((item: any) => this.mapSupabaseArticleToModel(item));
      }),
      catchError(error => {
        console.error('ArticleService: Error atrapado en getRecentArticles:', error);
        return throwError(() => error);
      })
    );
  }

  getCommentsForArticle(articleId: string): Observable<Comment[]> {
    return from(
      this.supabase
        .from('comments') 
        .select(`
          id,
          article_id,
          user_id,
          content,
          created_at,
          users!comments_user_id_fkey (username)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: true }) 
    ).pipe(
      tap(response => console.log('ArticleService: getCommentsForArticle - Respuesta de Supabase:', response)),
      map((response) => {
        if (response.error) {
          console.error('ArticleService: Error al cargar comentarios:', response.error);
          throw response.error;
        }
        return response.data.map((comment: any) => ({
          id: comment.id,
          article_id: comment.article_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          author_username: comment.users ? comment.users.username : 'Usuario Desconocido'
        })) as Comment[];
      }),
      catchError(error => {
        console.error('ArticleService: Error atrapado en getCommentsForArticle:', error);
        return throwError(() => error);
      })
    );
  }

  addComment(comment: Partial<Comment>): Observable<Comment> {
    const currentUserPromise = this.supabase.auth.getUser();
    return from(currentUserPromise).pipe(
      switchMap(async ({ data, error }) => {
        if (error || !data.user) {
          console.error('ArticleService: Error al obtener usuario autenticado para añadir comentario:', error);
          throw new Error('Usuario no autenticado para añadir comentario.');
        }
        const username = data.user.user_metadata?.['username'] || data.user.email;
        const fullComment: Comment = {
          article_id: comment.article_id!,
          user_id: data.user.id,
          author_username: username,
          content: comment.content!
        };
        
        console.log('ArticleService: Insertando comentario:', fullComment);
        const { data: insertedCommentData, error: insertCommentError } = await this.supabase
          .from('comments')
          .insert(fullComment)
          .select()
          .single();

        if (insertCommentError) {
          console.error('ArticleService: Error al insertar comentario en la base de datos:', insertCommentError);
          throw insertCommentError;
        }
        return {
          ...insertedCommentData,
          author_username: username
        } as Comment;
      }),
      catchError(err => {
        console.error('ArticleService: Error atrapado en addComment:', err);
        return throwError(() => err);
      })
    );
  }
  
  updateArticle(articleId: string, updatedArticle: Partial<Article>): Observable<Article> {
    return from(this.supabase.auth.getUser()).pipe(
      switchMap(async ({ data: userData, error: userError }) => {
        if (userError || !userData.user) {
          console.error('ArticleService: Error al obtener usuario autenticado para actualizar artículo:', userError);
          throw new Error('Usuario no autenticado.');
        }

        const currentUserId = userData.user.id;
        const { data: existingArticle, error: fetchError } = await this.supabase
          .from('articles')
          .select('author_id')
          .eq('id', articleId)
          .single();

        if (fetchError) {
          console.error('ArticleService: Error al buscar artículo para actualizar:', fetchError);
          throw fetchError;
        }
        if (!existingArticle) {
          throw new Error('Artículo no encontrado.');
        }
        if (existingArticle.author_id !== currentUserId) {
          console.warn('ArticleService: Intento de actualización de artículo no autorizado por el usuario:', currentUserId);
          throw new Error('No tienes permiso para actualizar este artículo.');
        }

        const updateData: {
          title?: string;
          subtitle?: string;
          content?: string;
          image_url?: string | null;
        } = {};

        if (updatedArticle.title !== undefined) updateData.title = updatedArticle.title;
        if (updatedArticle.subtitle !== undefined) updateData.subtitle = updatedArticle.subtitle;
        if (updatedArticle.content !== undefined) updateData.content = updatedArticle.content;
        if (updatedArticle.imageUrl !== undefined) {
          updateData.image_url = updatedArticle.imageUrl === null ? null : updatedArticle.imageUrl;
        }

        const { data: updatedData, error: updateError } = await this.supabase
          .from('articles')
          .update(updateData)
          .eq('id', articleId)
          .select(`
            id,
            title,
            subtitle,
            content,
            image_url,
            created_at,
            author_id,
            users!articles_author_id_fkey (username)
          `)
          .single();

        if (updateError) {
          console.error('ArticleService: Error al actualizar el artículo:', updateError);
          throw updateError;
        }

        console.log('ArticleService: Artículo actualizado con éxito:', updatedData);
        return this.mapSupabaseArticleToModel(updatedData);
      }),
      catchError(error => {
        console.error('ArticleService: Error atrapado en updateArticle:', error);
        return throwError(() => error);
      })
    );
  }

  deleteArticle(articleId: string): Observable<void> {
    return from(this.supabase.auth.getUser()).pipe(
      switchMap(async ({ data: userData, error: userError }) => {
        if (userError || !userData.user) {
          console.error('ArticleService: Error al obtener usuario autenticado para eliminar artículo:', userError);
          throw new Error('Usuario no autenticado.');
        }

        const currentUserId = userData.user.id;
        const { data: existingArticle, error: fetchError } = await this.supabase
          .from('articles')
          .select('author_id')
          .eq('id', articleId)
          .single();

        if (fetchError) {
          console.error('ArticleService: Error al buscar artículo para eliminar:', fetchError);
          throw fetchError;
        }
        if (!existingArticle) {
          throw new Error('Artículo no encontrado.');
        }
        if (existingArticle.author_id !== currentUserId) {
          console.warn('ArticleService: Intento de eliminación de artículo no autorizado por el usuario:', currentUserId);
          throw new Error('No tienes permiso para eliminar este artículo.');
        }

        const { error: deleteError } = await this.supabase
          .from('articles')
          .delete()
          .eq('id', articleId);

        if (deleteError) {
          console.error('ArticleService: Error al eliminar el artículo:', deleteError);
          throw deleteError;
        }

        console.log('ArticleService: Artículo eliminado con éxito:', articleId);
        return;
      }),
      catchError(error => {
        console.error('ArticleService: Error atrapado en deleteArticle:', error);
        return throwError(() => error);
      })
    );
  }
}