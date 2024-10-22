import { Routes } from '@angular/router';
import { AuthenticatedGuard } from './shared/guards/authenticated.guard';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthenticatedGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth-pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth-pages/register/register.page').then(
        (m) => m.RegisterPage
      ),
  },
];
