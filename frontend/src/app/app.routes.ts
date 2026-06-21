import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { ForgotPasswordComponent } from './features/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { JobFormComponent } from './features/job-form/job-form.component';
import { UserManagementComponent } from './features/user-management/user-management.component';
import { DecisionPanelComponent } from './features/decision-panel/decision-panel.component';
import { ReportComponent } from './features/report/report.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'recuperar-senha', component: ForgotPasswordComponent },
  { path: 'redefinir-senha', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'vagas/nova', component: JobFormComponent, canActivate: [AuthGuard] },
  {
    path: 'rh/usuarios',
    component: UserManagementComponent,
    canActivate: [AuthGuard],
    data: { role: 'RH' }
  },
  {
    path: 'rh/decisoes',
    component: DecisionPanelComponent,
    canActivate: [AuthGuard],
    data: { role: 'RH' }
  },
  {
    path: 'rh/relatorios',
    component: ReportComponent,
    canActivate: [AuthGuard],
    data: { role: 'RH' }
  }
];
