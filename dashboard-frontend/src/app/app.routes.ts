import { Routes } from '@angular/router';
import { StartupSimpleComponent } from './components/startup/startup-simple.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardSimple } from './guards/auth-simple.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'startup', component: StartupSimpleComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardSimple] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuardSimple] },
  { path: '**', redirectTo: '/startup' }
];



