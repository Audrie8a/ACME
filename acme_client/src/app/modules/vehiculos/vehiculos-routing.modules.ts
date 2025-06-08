import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VehiculoView } from './vehiculo-view/vehiculo-view';
import { Admin } from './admin/admin';
import { ResumenView } from './resumen-view/resumen-view';

const routes: Routes = [
  { path: 'vehiculos', component: VehiculoView, title: 'Vehículos' },
  { path: 'admin', component: Admin, title: 'Admin tools' },
  { path: 'dataHistorica', component: ResumenView, title: 'Data Histórica' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculosRoutingModule {}
