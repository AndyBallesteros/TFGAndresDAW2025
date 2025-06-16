import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Article } from '../models/article.model'; 
import { getSupabaseClient } from '../supabase.config';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private supabase: SupabaseClient;

  constructor() {
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
      author_id: item.author_id,
      author: item.users ? item.users.username : (item.author_name || 'Autor Desconocido') 
    } as Article;
  }

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
          users!articles_author_id_fkey (username) // Clave foránea corregida
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
          users!articles_author_id_fkey (username) // Clave foránea corregida
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
          users!articles_author_id_fkey (username) // Clave foránea corregida
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
            users!articles_author_id_fkey (username) // Clave foránea corregida
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
          users!articles_author_id_fkey (username) // Clave foránea corregida
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
}
