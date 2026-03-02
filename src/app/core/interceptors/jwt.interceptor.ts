import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const authService = inject(AuthService);
    const currentUser = authService.currentUserValue;
    const isLoggedIn = currentUser && currentUser.token;

    // Check if the request is to our backend API
    const isApiUrl = req.url.startsWith('http://localhost:8081/api');

    if (isLoggedIn && isApiUrl) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${currentUser.token}`
            }
        });
    }

    return next(req);
};
