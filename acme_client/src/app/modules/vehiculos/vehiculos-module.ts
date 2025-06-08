import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiculosRoutingModule } from './vehiculos-routing.modules';
import { VehiculoView } from './vehiculo-view/vehiculo-view';

@NgModule({
  imports: [
    CommonModule,
    VehiculosRoutingModule,
    VehiculoView // ✅ componente standalone
  ]
})
export class VehiculosModule {}
