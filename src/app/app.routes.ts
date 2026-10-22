import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./features/auth/access-denied/access-denied').then((m) => m.AccessDenied),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./features/campaigns/campaign-list/campaign-list').then((m) => m.CampaignList),
      },
      {
        path: 'campaigns/new',
        loadComponent: () =>
          import('./features/campaigns/campaign-create/campaign-create').then(
            (m) => m.CampaignCreate,
          ),
      },
      {
        path: 'campaigns/:id',
        loadComponent: () =>
          import('./features/campaigns/campaign-details/campaign-details').then(
            (m) => m.CampaignDetailsPage,
          ),
      },
      {
        path: 'app-users',
        loadComponent: () =>
          import('./features/users/app-users/app-users').then((m) => m.AppUsers),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-lookup/user-lookup').then((m) => m.UserLookup),
      },
      {
        path: 'ai/usage',
        loadComponent: () =>
          import('./features/ai/usage-dashboard/usage-dashboard').then((m) => m.UsageDashboard),
      },
      {
        path: 'ai/pricing',
        loadComponent: () => import('./features/ai/pricing/pricing').then((m) => m.Pricing),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
