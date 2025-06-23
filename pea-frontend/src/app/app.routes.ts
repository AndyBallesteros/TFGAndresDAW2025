import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { AboutComponent } from './about/about';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './user/dashboard/dashboard';
import { SubmitArticleComponent } from './user/submit-article/submit-article';
import { NoticiasListComponent } from './noticias/noticias-list/noticias-list';
import { EmailConfirmationComponent } from './auth/email-confirmation/email-confirmation';
import { ContactoComponent } from './contacto/contacto'; 
import { PrivacyPolicyComponent } from './policy-privacy/policy-privacy'; 
import { TermsOfServiceComponent } from './terms-service/terms-service'; 
import { NoticiaComponent } from './noticias/noticia/noticia';
import { LoggedInGuard } from './guards/logged-in.guard';
import { ApprovedGuard } from './guards/Approved.guard';
import { EditArticleComponent } from './user/edit-article/edit-article';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sobre-nosotros', component: AboutComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'noticias', component: NoticiasListComponent },
  { path: 'email-confirmation', component: EmailConfirmationComponent },
  { path: 'contact', component: ContactoComponent },
  { path: 'politica-privacidad', component: PrivacyPolicyComponent },
  { path: 'terminos-servicio', component: TermsOfServiceComponent }, 
  { path: 'article/:id', component: NoticiaComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'submit-article',
    component: SubmitArticleComponent,
    canActivate: [ApprovedGuard]
  },
  {
    path: 'edit-article/:id',
    component:EditArticleComponent,
    canActivate: [ApprovedGuard]
  },
  { path: '**', redirectTo: '' }
];