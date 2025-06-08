// menu.component.ts
import { Component }            from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule }         from '@angular/common';
import { MatMenuModule }        from '@angular/material/menu';
import { MatIconModule }        from '@angular/material/icon';

@Component({
  standalone: true,               // ← Importante para standalone components
  selector: 'app-menu-component',
  imports: [
    CommonModule,                 // trae NgIf, NgFor, pipes, etc.
    RouterModule,                 // para routerLink y routerLinkActive
    MatMenuModule,
    MatIconModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  // Hacemos público el router para usarlo en el template
  constructor(public router: Router) {}
}
