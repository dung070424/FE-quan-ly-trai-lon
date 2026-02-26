import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Medicine {
    id?: number;
    medicineCode?: string;
    name: string;
    manufacturer?: string;
    expiryDate?: string;
    note?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ThuocService {
    private apiUrl = 'http://localhost:8081/api/medicines';

    constructor(private http: HttpClient) { }

    getAllMedicines(): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(this.apiUrl);
    }

    getMedicineById(id: number): Observable<Medicine> {
        return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
    }

    createMedicine(medicine: Medicine): Observable<Medicine> {
        return this.http.post<Medicine>(this.apiUrl, medicine);
    }

    updateMedicine(id: number, medicine: Medicine): Observable<Medicine> {
        return this.http.put<Medicine>(`${this.apiUrl}/${id}`, medicine);
    }

    deleteMedicine(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
