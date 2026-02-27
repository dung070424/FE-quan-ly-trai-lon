import { Routes } from '@angular/router';
import { PigSalesComponent } from './features/pig-sales/pig-sales.component';
import { NhanVienComponent } from './features/nhan-vien/nhan-vien.component';
import { ThuocComponent } from './features/thuoc/thuoc.component';
import { KhoThuocComponent } from './features/kho-thuoc/kho-thuoc.component';
import { CamComponent } from './features/cam/cam.component';
import { KhoCamComponent } from './features/kho-cam/kho-cam.component';

export const routes: Routes = [
    { path: '', redirectTo: 'quan-ly-ban-lon', pathMatch: 'full' },
    { path: 'quan-ly-ban-lon', component: PigSalesComponent },
    { path: 'quan-ly-nhan-vien', component: NhanVienComponent },
    { path: 'quan-ly-thuoc', component: ThuocComponent },
    { path: 'quan-ly-kho-thuoc', component: KhoThuocComponent },
    { path: 'quan-ly-cam-an', component: CamComponent },
    { path: 'quan-ly-kho-cam', component: KhoCamComponent },
];
