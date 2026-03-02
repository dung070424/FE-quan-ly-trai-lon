import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  sidebarOpen = signal(true);
  isLoginPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoginPage = event.urlAfterRedirects.includes('/login');
    });
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
}
