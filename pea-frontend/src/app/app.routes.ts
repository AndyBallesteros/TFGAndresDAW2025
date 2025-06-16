import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { AboutComponent } from './about/about';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './user/dashboard/dashboard';
import { SubmitArticleComponent } from './user/submit-article/submit-article';
import { NoticiasListComponent } from './noticias/noticias-list/noticias-list';
import { AuthGuard } from './guards/auth-guard';
import { EmailConfirmationComponent } from './auth/email-confirmation/email-confirmation';
import { ContactoComponent } from './contacto/contacto'; 
import { PrivacyPolicyComponent } from './policy-privacy/policy-privacy'; 
import { TermsOfServiceComponent } from './terms-service/terms-service'; 

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sobre-nosotros', component: AboutComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'noticias', component: NoticiasListComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'submit-article', component: SubmitArticleComponent, canActivate: [AuthGuard] },
  { path: 'email-confirmation', component: EmailConfirmationComponent },
  { path: 'contact', component: ContactoComponent },
  { path: 'politica-privacidad', component: PrivacyPolicyComponent },
  { path: 'terminos-servicio', component: TermsOfServiceComponent }, 

  // { path: 'article/:id', component: ArticleDetailComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'submit-article',
    component: SubmitArticleComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];