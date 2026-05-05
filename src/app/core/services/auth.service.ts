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
        // Không lưu vào sessionStorage/localStorage để bắt buộc đăng nhập lại khi F5
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
                        // Chỉ lưu trên biến memory của service
                        this.currentUserSubject.next(user);
                    }
                    return user;
                })
            );
    }

    forgotPassword(data: { username: string, email: string }): Observable<any> {
        // expect text response or json, we map it as text to prevent parsing errors if backend sends plain string
        return this.http.post(`${this.apiUrl}/forgot-password`, data, { responseType: 'text' });
    }

    resetPassword(data: { username: string, resetCode: string, newPassword: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, data, { responseType: 'text' });
    }

    logout() {
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }
}
