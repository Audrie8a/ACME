import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login-view',
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatCardModule, MatIconModule],
  templateUrl: './login-view.html',
  styleUrl: './login-view.css'
})
export class LoginView {
usuario = '';
  contrasena = '';

  login(): void {
    console.log('Iniciar sesión con:', this.usuario, this.contrasena);
  }

  registrar(): void {
    console.log('Ir a registro');
  }
}
