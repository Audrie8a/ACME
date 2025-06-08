import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'vehiculos',
    loadChildren: () => import('./modules/vehiculos/vehiculos-module').then(m => m.VehiculosModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login-module').then(m => m.LoginModule)
  },  
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard-module').then(m => m.DashboardModule)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
