// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { NavbarComponent } from "./nav-bar/nav-bar"; 
import { HomeComponent } from "./home/home"; 
import { AboutComponent } from "./about/about";
import { RegisterComponent } from './auth/register/register'; 
import { LoginComponent } from './auth/login/login'; 
import { DashboardComponent } from './user/dashboard/dashboard'; 
import { SubmitArticleComponent } from './user/submit-article/submit-article'; 
import { NoticiasListComponent } from './noticias/noticias-list/noticias-list'; 
import { FooterComponent } from './footer/footer';
@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    CommonModule,
    RouterOutlet, 
    NavbarComponent,
    FooterComponent,
    // HomeComponent,
    // AboutComponent,
    // RegisterComponent,
    // LoginComponent,
    // DashboardComponent,
    // SubmitArticleComponent,
    // NoticiasListComponent
  ],
  templateUrl: './app.html', 
  styleUrl: './app.css' 
})
export class AppComponent {
  protected title = 'Politólogos en Acción'; 
}