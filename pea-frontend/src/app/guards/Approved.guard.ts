import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApprovedGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.user$.pipe(
      map(user => {
        if (user && user.isApproved) {
          console.log('ApprovedGuard: Acceso permitido. Usuario autenticado y aprobado.');
          return true; 
        } else {
          if (user && !user.isApproved) {
            alert('Tu cuenta aún no ha sido aprobada por un administrador para esta acción. Por favor, espera la aprobación.');
            return this.router.createUrlTree(['/dashboard']); 
          } else {
            alert('Necesitas iniciar sesión para acceder a esta página.');
            return this.router.createUrlTree(['/login']);
          }
        }
      })
    );
  }
}
