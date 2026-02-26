import { Component, signal } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { PigSalesComponent } from './features/pig-sales/pig-sales.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, PigSalesComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  sidebarOpen = signal(true);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
}
