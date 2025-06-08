import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardView } from './dashboard-view/dashboard-view';

const routes: Routes = [
  { path: 'dashboard', component: DashboardView, title: 'Dashboard' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
