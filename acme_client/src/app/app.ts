import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './components/menu.component/menu.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,MenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'acme_client';
}
