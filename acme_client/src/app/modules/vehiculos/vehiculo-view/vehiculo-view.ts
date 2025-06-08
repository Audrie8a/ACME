import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { VehiculoService } from '../../../service/vehiculo-service';
import { RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-vehiculo-view',
  standalone: true,
  imports: [CommonModule,
    HttpClientModule,
    MatTableModule,
    MatCardModule,
    MatMenuModule,   // ✅ para menú desplegable
    MatIconModule,   // ✅ para íconos
    MatButtonModule
  ],
  templateUrl: './vehiculo-view.html',
  styleUrls: ['./vehiculo-view.css']
})
export class VehiculoView implements OnInit {
  vehiculos: any[] = [];

  displayedColumns: string[] = ['vin', 'modelo', 'anio', 'sucursal', 'fecha_venta', 'usuario', 'accion'];


  constructor(private vehiculoService: VehiculoService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.cargarData();
  }

  cargarData(): void {
    this.vehiculoService.getVehiculos().subscribe(data => {
      this.vehiculos = data;
      this.cdr.detectChanges();
    });

  }

  editar(v: any) {
    console.log('Editar', v);
  }

  eliminar(v: any) {
    console.log('Eliminar', v);
  }

  tracking(v: any) {
    console.log('Tracking', v);
  }

  exportarCSV(): void {
  const encabezado = ['VIN', 'Modelo', 'Año','Id Sucursal',  'Sucursal', 'Fecha Venta', 'Usuario'];
  const filas = this.vehiculos.map(v =>
    [v.vin, v.modelo, v.anio,v.idSucursal,  v.sucursal, v.fecha_venta, v.usuario].join(',')
  );

  console.log(this.vehiculos); 
  const csvContent = [encabezado.join(','), ...filas].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'vehiculos.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  this.cdr.detectChanges();
}

}
