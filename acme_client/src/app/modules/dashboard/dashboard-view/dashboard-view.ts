import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { SocketServiceTs } from '../../../service/socket.service.ts';
import { NgxApexchartsModule } from 'ngx-apexcharts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

interface Estado {
  IdDispositivo: string;
  FechaHora: Date;
  EstadoCarga: number;
  OnOff: boolean;
  Estado: string;
  Kilometros: number;
}

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [NgxApexchartsModule, CommonModule, FormsModule],
  templateUrl: './dashboard-view.html',
  styleUrls: ['./dashboard-view.css']
})
export class DashboardView implements OnInit, OnDestroy {
  estados: Estado[] = [];
  filteredEstados: Estado[] = [];
  isBrowser: boolean = false;
  selectedVin: string = '';
  availableVins: string[] = [];
  loading: boolean = true;
  connectionStatus: boolean = false;
  currentCharge: number | null = null;
  onOffChartOptions: any;
  
  private subscriptions = new Subscription();

  // Configuraciones para cada gráfico
  cargaChartOptions: any;
  kilometrosChartOptions: any;
  estadoActivoInfo: { show: boolean, value: string } = { show: false, value: '' };
  erroresChartOptions: any;
  rankingChartOptions: any;

  constructor(
    private socketService: SocketServiceTs,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.inicializarConfiguraciones();
      this.setupSocketConnection();
      this.loadAvailableVins();
      this.monitorConnectionStatus();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private setupSocketConnection() {
    this.subscriptions.add(
      this.socketService.onEstadoActualizado().subscribe({
        next: (response) => {
          if (response.success) {
            this.estados = response.data;
            this.applyFilter(false);
            this.loading = false;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error en socket:', err);
          this.loading = false;
        }
      })
    );

    this.subscriptions.add(
      this.socketService.onSocketError().subscribe({
        next: (error) => {
          console.error('Error del socket:', error);
        }
      })
    );
  }

  private monitorConnectionStatus() {
    this.subscriptions.add(
      this.socketService.getConnectionStatus().subscribe({
        next: (connected) => {
          this.connectionStatus = connected;
          if (!connected) {
            this.loading = true;
          }
        }
      })
    );
  }

  private loadAvailableVins() {
    this.subscriptions.add(
      this.socketService.getAvailableVins().subscribe({
        next: (vins) => {
          this.availableVins = vins;
        },
        error: (err) => {
          console.error('Error al cargar VINs:', err);
          this.availableVins = ['VIN00001', 'VIN00002', 'VIN00003', 'VIN00004', 'VIN00005'];
        }
      })
    );
  }

  applyFilter(fromUI: boolean = true) {
    this.loading = true;
    
    if (fromUI) {
      this.socketService.setFilter({ vin: this.selectedVin });
    }

    this.filteredEstados = this.selectedVin 
      ? this.estados.filter(e => e.IdDispositivo === this.selectedVin) 
      : this.estados;

    if (this.selectedVin) {
      const lastStatus = this.filteredEstados[this.filteredEstados.length - 1];
      this.currentCharge = lastStatus?.EstadoCarga ?? null;
    } else {
      this.currentCharge = null;
    }

    this.actualizarGraficas();
    this.loading = false;
  }

  clearFilter() {
    this.selectedVin = '';
    this.applyFilter();
    this.socketService.setFilter({});
  }

  reconnect() {
    this.socketService.reconnect();
  }

  private inicializarConfiguraciones() {
    const commonOptions = {
      chart: {
        animations: { enabled: true, easing: 'easeinout', speed: 800 },
        toolbar: { show: true }
      },
      stroke: { width: 2 },
      markers: { size: 5, hover: { size: 7 } },
      noData: { text: 'Cargando datos...', align: 'center' }
    };

    // Gráfico de Carga
    this.cargaChartOptions = {
      ...commonOptions,
      chart: { ...commonOptions.chart, type: 'line', height: 350 },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
      series: [],
      xaxis: {
        type: 'datetime',
        labels: { datetimeFormatter: { hour: 'HH:mm' } }
      },
      yaxis: {
        min: 0, max: 100,
        title: { text: 'Porcentaje de carga' },
        labels: { formatter: (val: number) => `${val}%` }
      },
      tooltip: {
        x: { format: 'dd/MM HH:mm' },
        y: { formatter: (val: number) => `${val}%` }
      }
    };

    // Gráfico de Kilómetros
    this.kilometrosChartOptions = {
      ...commonOptions,
      chart: { ...commonOptions.chart, type: 'line', height: 350 },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
      series: [],
      xaxis: {
        type: 'datetime',
        labels: { datetimeFormatter: { hour: 'HH:mm' } }
      },
      yaxis: {
        title: { text: 'Kilómetros' },
        labels: { formatter: (val: number) => `${val} km` }
      },
      tooltip: {
        x: { format: 'dd/MM HH:mm' },
        y: { formatter: (val: number) => `${val} km` }
      }
    };

    // Configuración de Errores
    this.erroresChartOptions = {
      ...commonOptions,
      chart: { ...commonOptions.chart, type: 'bar', height: 350 },
      plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
      dataLabels: { enabled: true },
      colors: ['#FF4560'],
      series: [],
      xaxis: { categories: [] },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} ocurrencias`,
          title: { formatter: (seriesName: string) => `Código ${seriesName}` }
        }
      }
    };

    // Gráfico de Ranking (solo sin filtro)
    this.rankingChartOptions = {
      ...commonOptions,
      chart: { ...commonOptions.chart, type: 'radar', height: 350 },
      series: [],
      xaxis: { categories: [] },
      yaxis: { show: false },
      title: { text: 'Ranking por Kilómetros', align: 'left' },
      markers: { size: 5, hover: { size: 7 } },
      fill: { opacity: 0.1 },
      stroke: { width: 2 }
    };
  }

  private actualizarGraficas() {
    if (!this.isBrowser || !this.filteredEstados.length) return;

    // Actualizar gráfico de carga
    this.updateCargaChart();
    
    // Actualizar gráfico de kilómetros
    this.updateKilometrosChart();
    
    // Actualizar información de estado activo
    this.updateEstadoActivo();
    
    // Actualizar gráfico de errores
    this.updateErroresChart();
    
    // Actualizar ranking (solo sin filtro)
    if (!this.selectedVin) {
      this.updateRankingChart();
    }
  }

  private updateCargaChart() {
    if (this.selectedVin) {
      // Modo filtrado - una sola línea
      this.cargaChartOptions.series = [{
        name: this.selectedVin,
        data: this.filteredEstados.map(e => ({
          x: new Date(e.FechaHora).getTime(),
          y: e.EstadoCarga
        }))
      }];
    } else {
      // Modo sin filtro - múltiples líneas
      this.cargaChartOptions.series = this.availableVins.map(vin => ({
        name: vin,
        data: this.filteredEstados
          .filter(e => e.IdDispositivo === vin)
          .map(e => ({
            x: new Date(e.FechaHora).getTime(),
            y: e.EstadoCarga
          }))
      }));
    }
    this.cargaChartOptions = {...this.cargaChartOptions};
  }

  private updateKilometrosChart() {
    if (this.selectedVin) {
      // Modo filtrado - una sola línea
      this.kilometrosChartOptions.series = [{
        name: this.selectedVin,
        data: this.filteredEstados.map(e => ({
          x: new Date(e.FechaHora).getTime(),
          y: e.Kilometros
        }))
      }];
    } else {
      // Modo sin filtro - múltiples líneas
      this.kilometrosChartOptions.series = this.availableVins.map(vin => ({
        name: vin,
        data: this.filteredEstados
          .filter(e => e.IdDispositivo === vin)
          .map(e => ({
            x: new Date(e.FechaHora).getTime(),
            y: e.Kilometros
          }))
      }));
    }
    this.kilometrosChartOptions = {...this.kilometrosChartOptions};
  }

  private updateEstadoActivo() {
    type VehicleStatus = {
      vin: string;
      active: boolean;
      lastStatus: Estado;
    };

    // Obtener el último estado de cada VIN con valor por defecto
    const vehicleStatuses: VehicleStatus[] = this.availableVins.map(vin => {
      const lastStatus = [...this.filteredEstados]
        .reverse()
        .find(e => e.IdDispositivo === vin);
      
      const defaultStatus: Estado = {
        IdDispositivo: vin,
        FechaHora: new Date(),
        EstadoCarga: 0,
        OnOff: false,
        Estado: '000',
        Kilometros: 0
      };
      
      return {
        vin,
        active: (lastStatus || defaultStatus).OnOff,
        lastStatus: lastStatus || defaultStatus
      };
    });

    if (this.selectedVin) {
      // Modo con VIN seleccionado - mostrar gráfico de pie simple
      const selectedVehicle = vehicleStatuses.find(v => v.vin === this.selectedVin);
      const active = selectedVehicle?.active || false;
      
      this.onOffChartOptions = {
        chart: { type: 'pie', height: 350 },
        series: [active ? 1 : 0, active ? 0 : 1],
        labels: [
          `Activo: ${active ? 'Sí' : 'no'}`,
          `Carga actual: ${selectedVehicle?.lastStatus?.EstadoCarga || 0}%`
        ],
        colors: ['#4CAF50', '#F44336'],
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val > 0 ? 'ACTIVO' : 'INACTIVO'}`
        }
      };
    } else {
      // Modo sin filtro - gráfico de barras por VIN
      const categories = vehicleStatuses.map(v => v.vin);
      const activeData = vehicleStatuses.map(v => v.active ? 1 : 0);
      const inactiveData = vehicleStatuses.map(v => v.active ? 0 : 1);

      this.onOffChartOptions = {
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          animations: {
            enabled: true,
            easing: 'easeinout'
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '80%',
          }
        },
        series: [
          {
            name: 'Activos',
            data: activeData,
            color: '#4CAF50'
          },
          {
            name: 'Inactivos',
            data: inactiveData,
            color: '#F44336'
          }
        ],
        xaxis: {
          categories: categories,
          labels: {
            formatter: (value: string) => value
          },
          axisTicks: {
            show: false
          }
        },
        yaxis: {
          show: true,
          labels: {
            show: true
          }
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: (val: number, { seriesIndex }: any) => {
              return seriesIndex === 0 
                ? 'Activo' 
                : 'Inactivo';
            }
          },
          custom: ({ series, seriesIndex, dataPointIndex }: any) => {
            const status = vehicleStatuses[dataPointIndex];
            return `
              <div class="tooltip-container">
                <strong>${status.vin}</strong><br/>
                Estado: ${status.active ? 'Activo' : 'Inactivo'}<br/>
                Carga: ${status.lastStatus?.EstadoCarga || 0}%<br/>
                Kilómetros: ${status.lastStatus?.Kilometros || 0} km
              </div>
            `;
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number, { seriesIndex, dataPointIndex }: any) => {
            if (val > 0) {
              const status = vehicleStatuses[dataPointIndex];
              return seriesIndex === 0 
                ? '✅' 
                : '❌';
            }
            return '';
          },
          style: {
            fontSize: '16px'
          }
        },
        legend: {
          position: 'top',
          markers: {
            radius: 12
          }
        }
      };
    }
  }

  private updateErroresChart() {
    const errorDescriptions: {[key: string]: string} = {
      '101': 'Falla en sistema de carga',
      '102': 'Batería crítica',
      '201': 'Problema motor principal',
      '202': 'Falla en frenos',
      '301': 'Sensores desconectados',
      '302': 'Problema comunicación'
    };

    const erroresData = this.filteredEstados.reduce((acc, e) => {
      if (e.Estado !== '000') {
        acc[e.Estado] = (acc[e.Estado] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    this.erroresChartOptions = {
      chart: { type: 'bar', height: 350 },
      plotOptions: { bar: { horizontal: true } },
      series: [{
        name: 'Errores',
        data: Object.values(erroresData)
      }],
      xaxis: {
        categories: Object.keys(erroresData).map(code => 
          `Código ${code}: ${errorDescriptions[code] || 'Error desconocido'}`
        )
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} ocurrencias`
        }
      }
    };
  }

  private updateRankingChart() {
    const rankingData = this.filteredEstados.reduce((acc, e) => {
      if (!acc[e.IdDispositivo] || e.Kilometros > acc[e.IdDispositivo]) {
        acc[e.IdDispositivo] = e.Kilometros;
      }
      return acc;
    }, {} as Record<string, number>);

    this.rankingChartOptions.series = [{
      name: 'Kilómetros',
      data: Object.values(rankingData).map(Number)
    }];
    this.rankingChartOptions.xaxis.categories = Object.keys(rankingData);
    this.rankingChartOptions = {...this.rankingChartOptions};
  }
}