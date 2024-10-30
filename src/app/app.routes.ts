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
  {
    path: 'payment-fail',
    loadComponent: () => import('./pages/payment-pages/payment-fail/payment-fail.page').then( m => m.PaymentFailPage)
  },
  {
    path: 'payment-success',
    loadComponent: () => import('./pages/payment-pages/payment-success/payment-success.page').then( m => m.PaymentSuccessPage)
  },
  {
    path: 'test',
    loadComponent: () => import('./pages/test/test.page').then( m => m.TestPage)
  },
  {
    path: 'create-investment-contract',
    loadComponent: () => import('./pages/contract-pages/create-investment-contract/create-investment-contract.page').then( m => m.CreateInvestmentContractPage)
  },

];
