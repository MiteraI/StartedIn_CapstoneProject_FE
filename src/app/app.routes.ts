import { Routes } from '@angular/router'
import { AuthenticatedGuard } from './shared/guards/authenticated.guard'
import { mobileViewGuard } from './shared/guards/mobile-view.guard'

export const routes: Routes = [
  {
    path: 'project-list',
    canActivate: [AuthenticatedGuard],
    loadComponent: () => import('./pages/project-list/project-list.page').then((m) => m.ProjectListPage),
  },
  {
    path: '',
    redirectTo: 'project-list',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth-pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth-pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'payment-fail',
    loadComponent: () => import('./pages/payment-pages/payment-fail/payment-fail.page').then((m) => m.PaymentFailPage),
  },
  {
    path: 'payment-success',
    loadComponent: () => import('./pages/payment-pages/payment-success/payment-success.page').then((m) => m.PaymentSuccessPage),
  },
  {
    path: 'create-investment-contract',
    loadComponent: () => import('./pages/contract-pages/create-investment-contract/create-investment-contract.page').then((m) => m.CreateInvestmentContractPage),
  },

  {
    path: 'project-list/:id',
    loadComponent: () => import('./pages/project-details/project-details.page').then((m) => m.ProjectDetailsPage),
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: 'tasks',
        loadComponent: () => import('./components/task-page/task-view/task-view.component').then((m) => m.TaskViewComponent),
      },
      {
        path: 'contracts',
        loadComponent: () => import('./pages/contract-pages/contract-list/contract-list.page').then((m) => m.ContractListPage),
      },
      {
        path: 'others',
        canActivate: [mobileViewGuard],
        loadComponent: () => import('./layouts/mobile-project-details-navbar/mobile-project-details-navbar.component').then((m) => m.MobileProjectDetailsNavbarComponent),
      },
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'investor-project-list',
    loadComponent: () => import('./pages/investor-project-list/investor-project-list.page').then( m => m.InvestorProjectListPage)
  },

]
