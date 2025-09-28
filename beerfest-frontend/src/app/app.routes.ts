import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { OverviewComponent } from './pages/overview/overview';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'overview', component: OverviewComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' },
];
