import { Routes } from '@angular/router';
import { PigSalesComponent } from './features/pig-sales/pig-sales.component';
import { NhanVienComponent } from './features/nhan-vien/nhan-vien.component';
import { ThuocComponent } from './features/thuoc/thuoc.component';
import { KhoThuocComponent } from './features/kho-thuoc/kho-thuoc.component';
import { CamComponent } from './features/cam/cam.component';
import { KhoCamComponent } from './features/kho-cam/kho-cam.component';
import { TongQuanComponent } from './features/tong-quan/tong-quan';
import { QuanLySinhDeComponent } from './features/quan-ly-sinh-de/quan-ly-sinh-de.component';
import { QuanLyLonLaiComponent } from './features/quan-ly-lon-lai/quan-ly-lon-lai.component';
import { LoginComponent } from './features/login/login';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'tong-quan', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'tong-quan', component: TongQuanComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
    { path: 'quan-ly-ban-lon', component: PigSalesComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
    { path: 'quan-ly-nhan-vien', component: NhanVienComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
    { path: 'quan-ly-thuoc', component: ThuocComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'NHANVIEN'] } },
    { path: 'quan-ly-kho-thuoc', component: KhoThuocComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'NHANVIEN'] } },
    { path: 'quan-ly-cam-an', component: CamComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'NHANVIEN'] } },
    { path: 'quan-ly-kho-cam', component: KhoCamComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'NHANVIEN'] } },
    { path: 'quan-ly-lon-lai', component: QuanLyLonLaiComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'NHANVIEN'] } },
    { path: 'quan-ly-sinh-de', component: QuanLySinhDeComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'NHANVIEN'] } },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];
