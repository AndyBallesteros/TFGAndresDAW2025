import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { getSupabaseClient } from '../supabase.config';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;

  constructor(private router: Router) {
    this.supabase = getSupabaseClient();
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.user$ = this.userSubject.asObservable();

    this.supabase.auth.getSession().then(async ({ data }) => {
      console.log('AuthService: getSession inicial - data:', data);
      if (data?.session) {
        await this.loadUserProfile(data.session.user.id);
      } else {
        console.log('AuthService: No active session on app start. userSubject.next(null)');
        this.userSubject.next(null);
      }
    }).catch(e => console.error('AuthService: Error al obtener sesión inicial de Supabase:', e));

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthService: Auth state change event:', event, 'session:', session);
      if (session) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.userSubject.next(null);
        console.log('AuthService: Auth state changed to no session. userSubject.next(null)');
      }
    });
  }

  public get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  private async loadUserProfile(userId: string): Promise<void> {
    const { data: { user: supabaseAuthUser }, error: getUserError } = await this.supabase.auth.getUser();
    if (getUserError || !supabaseAuthUser) {
        console.error('AuthService: Error o usuario de autenticación no encontrado en loadUserProfile:', getUserError);
        this.userSubject.next(null);
        return;
    }
    if (supabaseAuthUser.id !== userId) {
        console.warn(`AuthService: ID de usuario de autenticación (${supabaseAuthUser.id}) no coincide con ID solicitado (${userId}). Limpiando sesión.`);
        this.userSubject.next(null);
        return;
    }

    const { data: userProfile, error: profileError } = await this.supabase
      .from('users')
      .select('username, is_approved')
      .eq('id', userId)
      .single();
      if (profileError) {
        console.error('AuthService: Error al cargar perfil de usuario de la tabla "users" en loadUserProfile:', JSON.stringify(profileError, null, 2));
        this.userSubject.next(null);
        return;
    }

    if (userProfile) {
      const appUser: User = {
        id: userId,
        email: supabaseAuthUser.email || '',
        username: userProfile.username,
        isApproved: userProfile.is_approved
      };
      this.userSubject.next(appUser);
    } else {
      console.warn(`AuthService: Perfil no encontrado para el usuario ${userId} en la tabla "users".`);
      this.userSubject.next(null);
    }
  }

  register(username: string, email: string, password: string): Observable<any> {
    return from(this.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username
        }
      }
    })).pipe(
      tap(supabaseRes => {
          if (supabaseRes.error) {
            console.error('AuthService: Error en signUp de Supabase (tap):', supabaseRes.error);
          }
      }),
      map(({ data: authData, error: authError }) => {
        if (authError) {
          console.error('AuthService: Error en auth.signUp -', authError);
          throw authError;
        }
        return authData;
      }),
      catchError(err => {
        console.error('AuthService: Error atrapado en el pipe de registro:', err);
        return throwError(() => err);
      })
    );
  }
  
  login(email: string, password: string): Observable<any> {
    return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
      tap(supabaseRes => {
        console.log('AuthService: Respuesta de signInWithPassword (tap):', supabaseRes);
        if (supabaseRes.error) {
          console.error('AuthService: Error en signInWithPassword (tap):', supabaseRes.error);
        }
      }),
      switchMap(async ({ data, error }) => {
        if (error) {
          console.error('AuthService: Error en auth.signInWithPassword desde switchMap -', error);
          throw error; 
        }
        if (data.user) {
          return data; 
        } else {
            console.warn('AuthService: signInWithPassword retornó sin datos de usuario. Esto podría indicar que el email no está confirmado.');
            throw new Error('Inicio de sesión exitoso, pero no se recibieron datos de usuario. ¿Email no confirmado?');
        }
      }),
      catchError(err => {
        console.error('AuthService: Error atrapado en el pipe de login:', err);
        return throwError(() => err); 
      })
    );
  }

  logout(): Observable<any> {
    return from(this.supabase.auth.signOut()).pipe(
      tap(() => {
        console.log('AuthService: Logout completado.');
        this.userSubject.next(null);
        this.router.navigate(['/login']);
      }),
      catchError(err => {
        console.error('AuthService: Error al intentar signOut de Supabase:', err);
        return throwError(() => err);
      })
    );
  }

  async getToken(): Promise<string | null> {
    try {
      const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();
      if (sessionError) {
        console.error('AuthService: Error al obtener sesión en getToken():', sessionError.message);
        return null;
      }
      
      if (sessionData && sessionData.session) {
        return sessionData.session.access_token;
      } else {
        return null;
      }
    } catch (e: any) {
      console.error('AuthService: Error inesperado en getToken():', e);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  isApproved(): boolean {
    return this.userSubject.value?.isApproved === true;
  }
}
