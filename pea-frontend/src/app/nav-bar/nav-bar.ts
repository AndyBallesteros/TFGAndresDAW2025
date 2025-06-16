import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../services/auth';
import { User } from '../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  templateUrl: './nav-bar.html', 
  // styleUrl: './navbar.css' 
})
export class NavbarComponent implements OnInit {
  navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Noticias', path: '/noticias' },
    { label: 'Sobre Nosotros', path: '/sobre-nosotros' },
    { label: 'Contacto', path: '/contact' },
  ];

  appTitle: string = 'Politólogos en Acción';
  registerText: string = 'Registro';
  loginText: string = 'Login';
  helloUserPrefix: string = 'Hola,'; 
  logoutText: string = 'Logout';

  isMenuOpen: boolean = false;
  currentUser: User | null = null;
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isMenuOpen = false;
      }, 
      error: (err) => {
        this.isMenuOpen = false;
        console.error('NavbarComponent: Error durante el logout:', err);
      }
    });
  }
}
