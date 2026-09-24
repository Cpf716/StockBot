import { LoginComponent } from './components/login/login.component';
import { QuoteComponent } from './components/quote/quote.component';
import { Routes } from '@angular/router';
import { SignupComponent } from './components/signup/signup.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: QuoteComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', component: LoginComponent },
];
