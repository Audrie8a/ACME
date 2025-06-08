import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceTs {

  private apiUrl = 'http://localhost:3000/api/realTimeData'; // Ajusta según tu configuración

  constructor(private http: HttpClient) {}

  generarResumen(fecha: string): Observable<{ inserted?: number; message?: string; }> {
    return this.http.post<{ inserted?: number; message?: string; }>(
      `${this.apiUrl}/guardarResumen`,
      { fecha }
    );
  }
}
