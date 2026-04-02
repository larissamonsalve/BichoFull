import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DrawsComponent } from './components/draws/draws.component';
import { AdminComponent } from './components/admin/admin.component';
import { HistoryComponent } from './components/history/history.component';

/**
 * @description Mapeamento central das rotas da aplicação (Routing).
 * Interliga os caminhos da URL aos respetivos Standalone Components.
 */
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'draws', component: DrawsComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'history', component: HistoryComponent },
  
  // Rota de fallback: Qualquer URL não mapeada redireciona para a Home.
  { path: '**', redirectTo: '' }
];