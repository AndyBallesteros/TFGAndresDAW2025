import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, tap, switchMap, catchError, throwError } from 'rxjs';
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
      if (data?.session) {
        await this.loadUserProfile(data.session.user.id);
      } else {
        console.log('AuthService: No active session on app start.');
        this.userSubject.next(null);
      }
    }).catch(e => console.error('AuthService: Error al obtener sesión inicial de Supabase:', e));

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthService: Auth state change event:', event, 'session:', session);
      if (session) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  public get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  private async loadUserProfile(userId: string): Promise<void> {
    console.log('AuthService: Cargando perfil para userId:', userId);

    const { data: { user: supabaseAuthUser }, error: getUserError } = await this.supabase.auth.getUser();
    console.log('AuthService: loadUserProfile - Resultado de getUser:', { supabaseAuthUser, getUserError }); // Log adicional

    if (getUserError || !supabaseAuthUser || supabaseAuthUser.id !== userId) {
        console.error('AuthService: Error o usuario no encontrado al cargar auth user en loadUserProfile:', getUserError);
        this.userSubject.next(null);
        return;
    }

    const { data: userProfile, error: profileError } = await this.supabase
      .from('users')
      .select('username, is_approved')
      .eq('id', userId)
      .single();
    console.log('AuthService: loadUserProfile - Resultado de SELECT de users:', { userProfile, profileError }); // Log adicional

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
      console.log('AuthService: Perfil de usuario cargado y asignado:', appUser);
      this.userSubject.next(appUser);
    } else {
      console.warn(`AuthService: Perfil no encontrado para el usuario ${userId} en la tabla "users".`);
      this.userSubject.next(null);
    }
    console.log('AuthService: loadUserProfile completado para userId:', userId); // Log adicional
  }

  register(username: string, email: string, password: string): Observable<any> {
    console.log('AuthService: Iniciando registro en Supabase Auth...');
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
          console.log('AuthService: Respuesta de signUp de Supabase (tap):', supabaseRes);
          if (supabaseRes.error) {
            console.error('AuthService: Error en signUp de Supabase (tap):', supabaseRes.error);
          }
      }),
      switchMap(async ({ data: authData, error: authError }) => {
        console.log('AuthService: switchMap de signUp - authData:', authData, 'authError:', authError);
        if (authError) {
          console.error('AuthService: Error en auth.signUp -', authError);
          throw authError;
        }

        if (authData.user) {
          console.log('AuthService: Usuario de autenticación creado, intentando crear perfil en la tabla "users"...');

          try {
            const { data: insertData, error: profileError } = await this.supabase
              .from('users')
              .insert({
                id: authData.user.id,
                username: username,
                email: email,
                is_approved: false
              })
              .select();

            console.log('AuthService: Resultado de inserción en tabla "users" - data:', insertData, 'error:', profileError);

            if (profileError) {
              console.error('AuthService: ERROR DETECTADO AL CREAR PERFIL (profileError):', JSON.stringify(profileError, null, 2));
              throw new Error('Error al completar el registro del perfil. Inténtalo de nuevo.');
            }
            if (!insertData || insertData.length === 0) {
                console.warn('AuthService: Inserción en tabla "users" recibió HTTP 200 OK, pero no se regresaron datos (insertData es vacío). Esto podría indicar una RLS restrictiva o un problema en el backend.');
            }

            console.log('AuthService: Perfil creado exitosamente en la tabla "users".');
          } catch (e: any) {
            console.error('AuthService: ERROR INESPERADO DURANTE LA INSERCIÓN DEL PERFIL:', e);
            throw new Error('Ocurrió un error inesperado durante el registro del perfil: ' + (e.message || e));
          }
        }
        return authData;
      })
    );
  }
  
  login(email: string, password: string): Observable<any> {
    console.log('AuthService: Iniciando login en Supabase Auth con email:', email);
    return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
      tap(supabaseRes => {
        console.log('AuthService: Respuesta de signInWithPassword (tap):', supabaseRes);
        if (supabaseRes.error) {
          console.error('AuthService: Error en signInWithPassword (tap):', supabaseRes.error);
        }
      }),
      switchMap(async ({ data, error }) => {
        console.log('AuthService: Inside switchMap - data:', data, 'error:', error); 
        if (error) {
          console.error('AuthService: Error en auth.signInWithPassword desde switchMap -', error);
          throw error;
        }
        if (data.user) {
          console.log('AuthService: Supabase Auth login exitoso para el usuario:', data.user.id);
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
    console.log('AuthService: Iniciando logout. Llamando a supabase.auth.signOut().');
    return from(this.supabase.auth.signOut()).pipe(
      tap(() => {
        console.log('AuthService: Logout completado en Supabase.');
        this.userSubject.next(null);
        this.router.navigate(['/login']);
      }),
      catchError(err => {
        console.error('AuthService: Error al intentar signOut de Supabase:', err);
        return throwError(() => err);
      })
    );
  }

  getToken(): Promise<string | null> {
    return this.supabase.auth.getSession().then(res => res.data.session?.access_token || null);
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  isApproved(): boolean {
    return this.userSubject.value?.isApproved === true;
  }
}
