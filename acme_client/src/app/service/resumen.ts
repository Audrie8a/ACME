// resumen.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Resumen {
  vin: string;
  fecha: string;                // 'YYYY-MM-DD'
  off_count: number;
  porcentaje_activo: number;
  error_count: number;
  errores_frecuentes: { estado: string; count: number }[];
  km_recorridos: number;
  prom_tiempo_activo: number;
  prom_tiempo_desconectado: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResumenService {

  private apiUrl = 'http://localhost:3000/api/dataHistorica';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene resúmenes filtrando por fecha y opcional VIN.
   * Si no se envía vin, devuelve todos los VINs.
   */
  getResumen(fechaIni: string, fechaFin: string, vin?: string): Observable<Resumen[]> {
    let params = new HttpParams().set('fechaIni', fechaIni).set('fechaFin', fechaFin);
    console.log("Fecha: ", fechaIni," - ", fechaFin); 
    if (vin) {
      params = params.set('vin', vin);
    }
    return this.http.get<Resumen[]>(`${this.apiUrl+"/resumen"}`, { params });
  }


}
