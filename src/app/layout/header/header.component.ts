import { Component, output, inject, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    menuClick = output<void>();
    private authService = inject(AuthService);
    private elementRef = inject(ElementRef);

    isUserMenuOpen = false;

    get currentUser() {
        return this.authService.currentUserValue;
    }

    toggleUserMenu(event: Event) {
        event.stopPropagation();
        this.isUserMenuOpen = !this.isUserMenuOpen;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isUserMenuOpen = false;
        }
    }

    logout() {
        this.authService.logout();
    }
}
