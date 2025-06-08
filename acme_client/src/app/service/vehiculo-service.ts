import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiUrl = 'http://localhost:3000/api/vehiculo';

  constructor(private http: HttpClient) {}

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
