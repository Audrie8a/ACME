import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { FormsModule }               from '@angular/forms';
import { HttpClientModule }          from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule }        from '@angular/material/form-field';
import { MatInputModule }            from '@angular/material/input';
import { MatButtonModule }           from '@angular/material/button';
import { MatCardModule }             from '@angular/material/card';
import { MatDatepickerModule }       from '@angular/material/datepicker';
import { MatNativeDateModule }       from '@angular/material/core';
import { NgxApexchartsModule }       from 'ngx-apexcharts';
import { ResumenService, Resumen }   from '../../../service/resumen';



@Component({
  selector: 'app-resumen-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxApexchartsModule
  ],
  templateUrl: './resumen-view.html',
  styleUrls: ['./resumen-view.css']
})
export class ResumenView implements OnInit {
  // enlazados por [(ngModel)]
  FechaIni: Date = new Date();
  FechaFin: Date = new Date();
  vin:       string = '';

  dataSource = new MatTableDataSource<Resumen>([]);
  displayedColumns = [
    'vin','fecha','off_count','porcentaje_activo',
    'error_count','km_recorridos',
    'prom_tiempo_activo','prom_tiempo_desconectado'
  ];

  // resumen-view.component.ts (fragmento)
public chartOptions: any = {
  series: [],
  chart: {
    type: 'bar',
    height: 350,
    stacked: true     // ← habilita el “stacked bar”
  },
  plotOptions: {
    bar: {
      horizontal: false
    }
  },
  xaxis: {
    categories: []    // aquí irán tus VIN
  },
  title: {
    text: 'Horas promedio Activo vs Desconectado por VIN'
  }
};


  constructor(private resumenSrv: ResumenService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.onFilter();  // carga inicial con hoy–hoy
  }

  onFilter() {
    const startStr = this.toStr(this.FechaIni);
    const endStr   = this.toStr(this.FechaFin);
    console.log('Fechas:', startStr, endStr, 'VIN:', this.vin);

    this.resumenSrv.getResumen(startStr, endStr, this.vin)
      .subscribe(rows => {
        this.dataSource.data = rows;
        this.construirGraficas(rows);
      }); 
  }

  private toStr(d: Date): string {
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth()+1).padStart(2,'0');
    const dd   = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  }

  construirGraficas(rows: Resumen[]) {
  // convierte a number y crea dos arrays de datos
  const dataActivo = rows.map(r => Number(r.prom_tiempo_activo/60).toFixed(2));
  const dataDesc   = rows.map(r => Number(r.prom_tiempo_desconectado/60).toFixed(2));

  this.chartOptions.series = [
    { name: 'Prom Activo (hr)', data: dataActivo },
    { name: 'Prom Desconectado (hr)', data: dataDesc }
  ];
  this.chartOptions.xaxis.categories = rows.map(r => r.vin);

  this.cdr.detectChanges();
}

}
