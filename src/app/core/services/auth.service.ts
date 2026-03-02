import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);

    private apiUrl = 'http://localhost:8081/api/auth';
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUserSubject.next(JSON.parse(storedUser));
            }
        }
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    public get isRoleAdmin(): boolean {
        const user = this.currentUserValue;
        return user && user.role === 'ADMIN';
    }

    public get isRoleNhanvien(): boolean {
        const user = this.currentUserValue;
        return user && user.role === 'NHANVIEN';
    }

    login(credentials: { username: string, password: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(user => {
                    if (user && user.token) {
                        if (isPlatformBrowser(this.platformId)) {
                            localStorage.setItem('currentUser', JSON.stringify(user));
                        }
                        this.currentUserSubject.next(user);
                    }
                    return user;
                })
            );
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('currentUser');
        }
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }
}
