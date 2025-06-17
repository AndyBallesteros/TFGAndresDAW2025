import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { NavbarComponent } from "./nav-bar/nav-bar"; 
import { FooterComponent } from './footer/footer';
@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    CommonModule,
    RouterOutlet, 
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './app.html', 
  styleUrl: './app.css' 
})
export class AppComponent implements OnInit{
  protected title = 'Politólogos en Acción'; 
  showScrollToTopButton: boolean = false;
  constructor (){}

  ngOnInit(): void{

  }
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showScrollToTopButton = window.pageYOffset > 200;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}