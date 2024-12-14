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
import { UserGuard } from './shared/guards/user.guard'
import { ProjectDisbursementDataResolver } from './shared/resolvers/project-disbursement-data.resolver'
import { InvestorDisbursementDataResolver } from './shared/resolvers/investor-disbursement-data.resolver'
import { TransactionDataResolver } from './shared/resolvers/transaction-data.resolver'
import { ProjectOverviewDataResolver } from './shared/resolvers/overview-projects-data.resolver'
import { AdminGuard } from './shared/guards/admin.guard'
import { AdminProjectDataResolver } from './shared/resolvers/admin-project-data.resolver'
import { UserDataResolver } from './shared/resolvers/user-data.resolver'
import { ProfileDataResolver } from './shared/resolvers/profile-data.resolver'
import { MentorGuard } from './shared/guards/mentor.guard'

export const routes: Routes = [
  {
    path: 'projects',
    canActivate: [AuthenticatedGuard],
    resolve: { userProjects: UserProjectDataResolver },
    loadComponent: () => import('./pages/project-pages/project-list/project-list.page').then((m) => m.ProjectListPage),
  },
  {
    path: '',
    canActivate: [AuthenticatedGuard],
    loadComponent: () => import('./pages/home-redirect/home-redirect.page').then((m) => m.HomeRedirectPage),
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
    path: 'explore-team',
    loadComponent: () => import('./components/find-team-page/find-team-view/find-team-view.component').then((m) => m.FindTeamViewComponent),
  },
  {
    path: 'project-overview/:projectId',
    loadComponent: () => import('./pages/project-overview/project-overview.page').then((m) => m.ProjectOverviewPage),
    resolve: { projectOverview: ProjectOverviewDataResolver },
    children: [
      {
        path: '', // Add this default route
        redirectTo: 'description',
        pathMatch: 'full',
      },
      {
        path: 'description',
        loadComponent: () => import('./components/project-pages/project-overview/project-description/project-description.component').then((m) => m.ProjectDescriptionComponent),
      },
      {
        path: 'charter',
        loadComponent: () => import('./components/project-pages/project-overview/project-charter/project-charter.component').then((m) => m.ProjectCharterComponent),
      },
    ],
  },
  {
    path: 'invite/:projectId/:role',
    loadComponent: () => import('./pages/project-pages/project-invite-page/project-invite-page.component').then((m) => m.ProjectInvitePage),
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./pages/project-details/project-details.page').then((m) => m.ProjectDetailsPage),
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: 'tasks',
        // canActivate: [UserGuard],
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
        path: 'deals',
        canActivate: [UserGuard],
        loadComponent: () => import('./pages/deal-offer-pages/project-deal-list/project-deal-list.page').then((m) => m.ProjectDealListPage),
      },
      {
        path: 'deals/:dealId',
        canActivate: [UserGuard],
        resolve: { deal: ProjectDealDataResolver },
        loadComponent: () => import('./pages/deal-offer-pages/project-deal-detail/project-deal-detail.page').then((m) => m.ProjectDealDetailPage),
      },
      {
        path: 'create-investment-contract',
        canActivate: [UserGuard],
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
        canActivate: [UserGuard],
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
        canActivate: [UserGuard],
        loadComponent: () => import('./pages/disbursement-pages/project-disbursement-list/project-disbursement-list.page').then((m) => m.ProjectDisbursementListPage),
      },
      {
        path: 'disbursements/:disbursementId',
        canActivate: [UserGuard],
        resolve: { disbursement: ProjectDisbursementDataResolver },
        loadComponent: () => import('./pages/disbursement-pages/project-disbursement-detail/project-disbursement-detail.page').then((m) => m.ProjectDisbursementDetailPage),
      },
      {
        path: 'milestones',
        loadComponent: () => import('./components/milestone-page/milestone-view/milestone-view.component').then((m) => m.MilestoneViewComponent),
      },
      {
        path: 'milestones/:milestoneId',
        loadComponent: () => import('./components/milestone-page/milestone-details-page/milestone-details-page.component').then((m) => m.MilestoneDetailsPageComponent),
      },
      {
        path: 'others',
        canActivate: [mobileViewGuard],
        loadComponent: () => import('./layouts/mobile-project-details-navbar/mobile-project-details-navbar.component').then((m) => m.MobileProjectDetailsNavbarComponent),
      },
      {
        path: 'investor-disbursements',
        canActivate: [InvestorGuard],
        loadComponent: () => import('./pages/disbursement-pages/investor-disbursement-list/investor-disbursement-list.page').then((m) => m.InvestorDisbursementListPage),
      },
      {
        path: 'equity',
        loadComponent: () => import('./pages/share-equities/share-equities.page').then((m) => m.ShareEquitiesPage),
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/transaction-pages/transactions/transactions.page').then((m) => m.TransactionsPage),
      },
      {
        path: 'transactions/:transactionId',
        resolve: { transaction: TransactionDataResolver },
        loadComponent: () => import('./pages/transaction-pages/transaction-details/transaction-details.page').then((m) => m.TransactionDetailsPage),
      },
      {
        path: 'create-transaction',
        loadComponent: () => import('./pages/transaction-pages/create-transaction/create-transaction.page').then((m) => m.CreateTransactionPage),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'payos',
        canActivate: [UserGuard],
        loadComponent: () => import('./pages/payment-pages/payos-setup/payos-setup.page').then((m) => m.PayosSetupPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'assets',
        loadComponent: () => import('./pages/asset-pages/asset-list/asset-list.page').then((m) => m.AssetListPage),
      },
      {
        path: 'buy-assets',
        loadComponent: () => import('./pages/asset-pages/buy-assets/buy-assets.page').then((m) => m.BuyAssetsPage),
      },
      {
        path: 'investment-call',
        canActivate: [UserGuard],
        loadComponent: () => import('./pages/investment-call-page/investment-call-page.page').then((m) => m.InvestmentCallPagePage),
      },
      {
        path: 'recruitment-post',
        loadComponent: () => import('./components/recruitment-page/recruitment-view/recruitment-view.component').then((m) => m.RecruitmentViewComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/project-pages/project-settings/project-settings.page').then((m) => m.ProjectSettingsPage),
      },

      {
        path: 'meeting',
        loadComponent: () => import('./pages/meeting/meeting.page').then((m) => m.MeetingPage),
      },
    ],
  },
  {
    path: 'explore',
    canActivate: [InvestorGuard],
    loadComponent: () => import('./pages/explore/explore.page').then((m) => m.InvestorExploreProjectsPage),
  },
  {
    path: 'deals',
    canActivate: [InvestorGuard],
    loadComponent: () => import('./pages/deal-offer-pages/investor-deal-list/investor-deal-list.page').then((m) => m.InvestorDealListPage),
  },
  {
    path: 'projects/:projectId/create-deal',
    canActivate: [InvestorGuard],
    resolve: { projectOverview: ProjectOverviewDataResolver },
    loadComponent: () => import('./pages/deal-offer-pages/create-deal-offer/create-deal-offer.page').then((m) => m.CreateDealOfferPage),
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
    path: 'disbursements/overview',
    canActivate: [InvestorGuard],
    loadComponent: () => import('./pages/disbursement-pages/investor-disbursement-overview/investor-disbursement-overview.page').then((m) => m.InvestorDisbursementOverviewPage),
  },
  {
    path: 'disbursements/history',
    canActivate: [InvestorGuard],
    loadComponent: () => import('./pages/transaction-pages/disbursement-history/disbursement-history.page').then((m) => m.DisbursementHistoryPage),
  },
  {
    path: 'disbursements/:disbursementId',
    canActivate: [InvestorGuard],
    resolve: { disbursement: InvestorDisbursementDataResolver },
    loadComponent: () => import('./pages/disbursement-pages/investor-disbursement-detail/investor-disbursement-detail.page').then((m) => m.InvestorDisbursementDetailPage),
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadComponent: () => import('./pages/admin-pages/admin-home/admin-home.page').then((m) => m.AdminHomePage),
  },
  {
    path: 'admin/projects',
    canActivate: [AdminGuard],
    loadComponent: () => import('./pages/admin-pages/admin-project-list/admin-project-list.page').then((m) => m.AdminProjectListPage),
  },
  {
    path: 'admin/projects/:projectId',
    canActivate: [AdminGuard],
    resolve: { project: AdminProjectDataResolver },
    loadComponent: () => import('./pages/admin-pages/admin-project-detail/admin-project-detail.page').then((m) => m.AdminProjectDetailPage),
  },
  {
    path: 'admin/users',
    canActivate: [AdminGuard],
    loadComponent: () => import('./pages/admin-pages/admin-user-list/admin-user-list.page').then((m) => m.AdminUserListPage),
  },
  {
    path: 'profile',
    canActivate: [AuthenticatedGuard],
    resolve: { profile: ProfileDataResolver },
    loadComponent: () => import('./pages/user-pages/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'users/:userId',
    canActivate: [AuthenticatedGuard],
    resolve: { user: UserDataResolver },
    loadComponent: () => import('./pages/user-pages/user-detail/user-detail.page').then((m) => m.UserDetailPage),
  },
  {
    path: 'transactions',
    canActivate: [AuthenticatedGuard],
    loadComponent: () => import('./pages/transaction-pages/self-transactions/self-transactions.page').then((m) => m.SelfTransactionsPage),
  },
]
