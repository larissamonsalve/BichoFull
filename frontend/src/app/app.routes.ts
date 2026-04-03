import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DrawsComponent } from './components/draws/draws.component';
import { AdminComponent } from './components/admin/admin.component';
import { HistoryComponent } from './components/history/history.component';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Rotas Públicas (Qualquer pessoa acede)
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rotas Protegidas (Requerem Login)
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
  { path: 'draws', component: DrawsComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard]},
  
  // Rota Ultra-Protegida (Requer Login E ser Admin)
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard]},

  // Rota de fallback: Qualquer URL não mapeada redireciona para a Home.
  { path: '**', redirectTo: '' }
];