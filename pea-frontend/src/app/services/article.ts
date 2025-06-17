import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError, tap, take } from 'rxjs/operators'; // Añadido 'take'
import { Article } from '../models/article.model';
import { Comment } from '../models/comment.model'; // <<-- Importado el modelo de comentario
import { getSupabaseClient } from '../supabase.config';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth'; // <<-- Importado el AuthService

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private supabase: SupabaseClient;

  // Inyectamos AuthService aquí para poder acceder a la información del usuario autenticado
  constructor(private authService: AuthService) {
    this.supabase = getSupabaseClient();
  }

  /**
   * Helper para mapear datos de Supabase (con joins) a tu modelo Article.
   * Se encarga de extraer el nombre de usuario del objeto 'users' si viene del join.
   */
  private mapSupabaseArticleToModel(item: any): Article {
    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      content: item.content,
      imageUrl: item.image_url,
      created_at: item.created_at,
      user_id: item.author_id, // Usamos author_id del item de la DB
      // El nombre del autor puede venir del join (item.users?.username) o de una columna directa (item.author_name)
      author: item.users ? item.users.username : (item.author_name || 'Autor Desconocido')
    } as Article;
  }

  /**
   * Obtiene todos los artículos ordenados por fecha de creación descendente.
   * Realiza un join con la tabla de usuarios (`users!articles_author_id_fkey`) para obtener el nombre del autor.
   */
  getArticles(): Observable<Article[]> {
    console.log('ArticleService: Llamada a getArticles().');
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
          users!articles_author_id_fkey (username) // <<-- Clave foránea específica de tu configuración de Supabase
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

  /**
   * Obtiene un artículo específico por su ID.
   * Realiza un join con la tabla de usuarios para obtener el nombre del autor.
   */
  getArticleById(id: string): Observable<Article> {
    console.log('ArticleService: Llamada a getArticleById() para ID:', id);
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
          users!articles_author_id_fkey (username) // <<-- Clave foránea específica de tu configuración
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

  /**
   * Obtiene artículos publicados por un autor específico, usando su ID.
   * Realiza un join con la tabla de usuarios para obtener el nombre del autor.
   */
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
          users!articles_author_id_fkey (username) // <<-- Clave foránea específica de tu configuración
        `)
        .eq('author_id', authorId) // Asumo que el ID del autor se guarda en la columna 'author_id'
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

  /**
   * Crea un nuevo artículo en la base de datos, asignando al usuario autenticado como autor.
   * Utiliza `supabase.auth.getUser()` para obtener el ID y nombre de usuario del autor.
   */
  createArticle(article: Article): Observable<Article> {
    console.log('ArticleService: Llamada a createArticle() para título:', article.title);
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
          author_id: data.user.id, // ID del usuario autenticado como autor
          author_name: username // Nombre de usuario del autor
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
            users!articles_author_id_fkey (username) // <<-- Clave foránea específica de tu configuración
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

  /**
   * Obtiene los artículos más recientes con un límite.
   * Incluye el nombre de usuario del autor a través de un join.
   * Utilizado principalmente en la página de inicio.
   */
  getRecentArticles(limit: number = 4): Observable<Article[]> {
    console.log(`ArticleService: Llamada a getRecentArticles(). Obteniendo los ${limit} artículos más recientes...`);
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
          users!articles_author_id_fkey (username) // <<-- Clave foránea específica de tu configuración
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
    console.log('ArticleService: Llamada a getCommentsForArticle() para articleId:', articleId);
    return from(
      this.supabase
        .from('comments') // Nombre de tu tabla de comentarios en Supabase
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
        // Mapear los datos para que 'author_username' se obtenga del join con 'users'
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
    console.log('ArticleService: Llamada a addComment() para articleId:', comment.article_id);
    const currentUserPromise = this.supabase.auth.getUser();

    return from(currentUserPromise).pipe(
      switchMap(async ({ data, error }) => {
        if (error || !data.user) {
          console.error('ArticleService: Error al obtener usuario autenticado para añadir comentario:', error);
          throw new Error('Usuario no autenticado para añadir comentario.');
        }
        // Obtener el nombre de usuario del metadata de Supabase Auth
        const username = data.user.user_metadata?.['username'] || data.user.email;
        const fullComment: Comment = {
          article_id: comment.article_id!,
          user_id: data.user.id,
          author_username: username, // Se guarda directamente en la tabla de comentarios
          content: comment.content!
        };
        
        console.log('ArticleService: Insertando comentario:', fullComment);
        const { data: insertedCommentData, error: insertCommentError } = await this.supabase
          .from('comments')
          .insert(fullComment)
          .select() // Para obtener el comentario insertado con su ID y created_at
          .single();

        if (insertCommentError) {
          console.error('ArticleService: Error al insertar comentario en la base de datos:', insertCommentError);
          throw insertCommentError;
        }
        console.log('ArticleService: Comentario insertado con éxito:', insertedCommentData);
        
        // Devolvemos el comentario completo, incluyendo el username que ya tenemos del usuario autenticado
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
}
