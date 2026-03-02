import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const currentUser = authService.currentUserValue;

    if (currentUser) {
        // check if route is restricted by role
        if (route.data && route.data['roles'] && route.data['roles'].indexOf(currentUser.role) === -1) {
            // role not authorized so redirect to home page based on role
            if (currentUser.role === 'NHANVIEN') {
                router.navigate(['/quan-ly-kho-cam']);
            } else {
                router.navigate(['/tong-quan']);
            }
            return false;
        }

        // logged in so return true
        return true;
    }

    // not logged in so redirect to login page with the return url
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};
