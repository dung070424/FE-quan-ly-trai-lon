import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardDto {
    totalRevenue: number;
    totalPigsSold: number;
    totalEmployees: number;
    totalMedicineCost: number;
    totalFeedCost: number;
    salesOverTime: { [key: string]: number };
    expensesOverTime: { [key: string]: number };
    pigsSoldOverTime: { [key: string]: number };
}

@Injectable({
    providedIn: 'root'
})
export class TongQuanService {
    private apiUrl = `http://localhost:8081/api/dashboard/summary`;

    constructor(private http: HttpClient) { }

    getSummary(): Observable<DashboardDto> {
        return this.http.get<DashboardDto>(this.apiUrl);
    }
}
