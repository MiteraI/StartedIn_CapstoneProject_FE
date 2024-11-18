import { Routes } from '@angular/router'
import { AuthenticatedGuard } from './shared/guards/authenticated.guard'
import { mobileViewGuard } from './shared/guards/mobile-view.guard'
import { ProjectDataResolver } from './shared/resolvers/project-data.resolver'
import { ProjectDealDataResolver } from './shared/resolvers/project-deal-data.resolver'
import { InvestmentContractDataResolver } from './shared/resolvers/investment-contract-data.resolver'
import { InternalContractDataResolver } from './shared/resolvers/internal-contract-data.resolver'
import { UserProjectDataResolver } from './shared/resolvers/user-projects-data.resolver'
import { InvestorDealDataResolver } from './shared/resolvers/investor-deal-data.resolver'
import { InvestorGuard } from './shared/guards/investor.guard'

export const routes: Routes = [
  {
    path: 'projects',
    canActivate: [AuthenticatedGuard],
    resolve: { userProjects: UserProjectDataResolver },
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
    path: 'projects/:id',
    loadComponent: () => import('./pages/project-details/project-details.page').then((m) => m.ProjectDetailsPage),
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: 'tasks',
        loadComponent: () => import('./components/task-page/task-view/task-view.component').then((m) => m.TaskViewComponent),
      },
      {
        path: 'charter',
        loadComponent: () => import('./pages/project-charter-pages/create-project-charter/create-project-charter.page').then((m) => m.CreateProjectCharterPage),
      },
      {
        path: 'contracts',
        loadComponent: () => import('./pages/contract-pages/contract-list/contract-list.page').then((m) => m.ContractListPage),
      },
      {
        path: 'create-deal',
        loadComponent: () => import('./pages/deal-offer-pages/create-deal-offer/create-deal-offer.page').then((m) => m.CreateDealOfferPage),
      },
      {
        path: 'deals',
        loadComponent: () => import('./pages/deal-offer-pages/project-deal-list/project-deal-list.page').then((m) => m.ProjectDealListPage),
      },
      {
        path: 'deals/:dealId',
        resolve: { deal: ProjectDealDataResolver },
        loadComponent: () => import('./pages/deal-offer-pages/project-deal-detail/project-deal-detail.page').then((m) => m.ProjectDealDetailPage),
      },
      {
        path: 'create-investment-contract',
        resolve: { project: ProjectDataResolver, deal: ProjectDealDataResolver },
        loadComponent: () => import('./pages/contract-pages/investment-contract/investment-contract.page').then((m) => m.InvestmentContractPage),
      },
      {
        path: 'investment-contract/:contractId',
        resolve: { project: ProjectDataResolver, contract: InvestmentContractDataResolver },
        loadComponent: () => import('./pages/contract-pages/investment-contract/investment-contract.page').then((m) => m.InvestmentContractPage),
      },
      {
        path: 'create-internal-contract',
        resolve: { project: ProjectDataResolver },
        loadComponent: () => import('./pages/contract-pages/internal-contract/internal-contract.page').then((m) => m.InternalContractPage),
      },
      {
        path: 'internal-contract/:contractId',
        resolve: { project: ProjectDataResolver, contract: InternalContractDataResolver },
        loadComponent: () => import('./pages/contract-pages/internal-contract/internal-contract.page').then((m) => m.InternalContractPage),
      },
      {
        path: 'disbursements',
        loadComponent: () => import('./pages/disbursement-pages/project-disbursement-list/project-disbursement-list.page').then((m) => m.ProjectDisbursementListPage),
      },
      {
        path: 'disbursements/:disbursementId',
        loadComponent: () => import('./pages/disbursement-pages/project-disbursement-detail/project-disbursement-detail.page').then((m) => m.ProjectDisbursementDetailPage),
      },
      {
        path: 'milestones',
        loadComponent: () => import('./components/milestone-page/milestone-view/milestone-view.component').then((m) => m.MilestoneViewComponent),
      },
      {
        path: 'others',
        canActivate: [mobileViewGuard],
        loadComponent: () => import('./layouts/mobile-project-details-navbar/mobile-project-details-navbar.component').then((m) => m.MobileProjectDetailsNavbarComponent),
      },
      {
        path: 'investor-disbursements',
        canActivate: [InvestorGuard],
        loadComponent: () => import('./pages/disbursement-pages/investor-disbursement-list/investor-disbursement-list.page').then( m => m.InvestorDisbursementListPage),
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
    canActivate: [InvestorGuard],
    loadComponent: () => import('./pages/investor-explore-projects/investor-explore-projects.page').then((m) => m.InvestorExploreProjectsPage),
  },
  {
    path: 'deals',
    canActivate: [InvestorGuard],
    loadComponent: () => import('./pages/deal-offer-pages/investor-deal-list/investor-deal-list.page').then((m) => m.InvestorDealListPage),
  },
  {
    path: 'deals/:dealId',
    canActivate: [InvestorGuard],
    resolve: { deal: InvestorDealDataResolver },
    loadComponent: () => import('./pages/deal-offer-pages/investor-deal-detail/investor-deal-detail.page').then((m) => m.InvestorDealDetailPage),
  },
  {
    path: 'disbursements',
    canActivate: [InvestorGuard],
    loadComponent: () => import('./pages/disbursement-pages/investor-disbursement-list/investor-disbursement-list.page').then((m) => m.InvestorDisbursementListPage),
  },
  {
    path: 'disbursements/:disbursementId',
    canActivate: [InvestorGuard],
    loadComponent: () => import('./pages/disbursement-pages/investor-disbursement-detail/investor-disbursement-detail.page').then((m) => m.InvestorDisbursementDetailPage),
  },
]
