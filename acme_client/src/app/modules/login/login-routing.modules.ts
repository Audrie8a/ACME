import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginView } from './login-view/login-view';

const routes: Routes = [
  { path: '', component: LoginView, title: 'Login' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule {}
