import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,       // <-- para que funcione con loadComponent
  imports: [RouterModule], // <-- importa RouterModule para routerLink
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss']
})
export class MenuComponent {
  // aquí puedes poner lógica si es necesario
}
