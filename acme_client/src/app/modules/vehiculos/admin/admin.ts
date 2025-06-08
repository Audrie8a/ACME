import { Component } from '@angular/core';
import { AdminServiceTs } from '../../../service/admin-service.ts.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
fecha: string = '';

  constructor(private simuladorService: AdminServiceTs) {}

  onGenerar(): void {
    if (!this.fecha) {
      alert('Por favor selecciona una fecha');
      return;
    }

    this.simuladorService.generarResumen(this.fecha)
      .subscribe(
        resp => {
          if (resp.inserted !== undefined) {
            alert(`Se insertaron ${resp.inserted} registros`);
          } else if (resp.message) {
            alert(resp.message);
          }
        },
        err => {
          console.error(err);
          alert('Error al generar resumen');
        }
      );
  }

  onBorrar(): void {
    console.log('Borrar data para fecha', this.fecha);
    // En el futuro llamará a un servicio para eliminar datos
  }
}
