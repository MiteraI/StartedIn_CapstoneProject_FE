import { Routes } from '@angular/router'
import { AuthenticatedGuard } from './shared/guards/authenticated.guard'
import { mobileViewGuard } from './shared/guards/mobile-view.guard'

export const routes: Routes = [
  {
    path: 'projects',
    canActivate: [AuthenticatedGuard],
    loadComponent: () => import('./pages/project-list/project-list.page').then((m) => m.ProjectListPage),
  },
  {
    path: '',
    redirectTo: 'projects',
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
    path: 'create-project-charter',
    loadComponent: () => import('./pages/project-charter-pages/create-project-charter/create-project-charter.page').then((m) => m.CreateProjectCharterPage),
  },
  {
    path: 'create-investment-contract',
    loadComponent: () => import('./pages/contract-pages/create-investment-contract/create-investment-contract.page').then((m) => m.CreateInvestmentContractPage),
  },

  {
    path: 'projects/:id',
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
        path: 'create-deal-offer',
        loadComponent: () => import('./pages/deal-offer-pages/create-deal-offer/create-deal-offer.page').then( m => m.CreateDealOfferPage)
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
    path: 'explore',
    loadComponent: () => import('./pages/investor-explore-projects/investor-explore-projects.page').then( m => m.InvestorExploreProjectsPage)
  },
  {
    path: 'investor-deal-offer-list',
    loadComponent: () => import('./pages/deal-offer-pages/investor-deal-offer-list/investor-deal-offer-list.page').then( m => m.InvestorDealOfferListPage)
  },
]
