import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CamInventory {
    id?: number;
    camId: number;
    camName?: string;
    expiryDate?: string;
    type?: string;
    quantity: number;
    unit?: string;
    minQuantity?: number;
    maxQuantity?: number;
    unitPrice?: number;
    location?: string;
    lastUpdated?: string;
}

export interface CamImportHistory {
    id?: number;
    camId: number;
    camName?: string;
    camCode?: string;
    importDate?: string;
    quantity: number;
    unit?: string;
    unitPrice?: number;
    totalPrice?: number;
}

@Injectable({
    providedIn: 'root'
})
export class KhoCamService {
    private apiUrl = 'http://localhost:8081/api/cam-inventory';

    constructor(private http: HttpClient) { }

    getAllInventory(): Observable<CamInventory[]> {
        return this.http.get<CamInventory[]>(this.apiUrl);
    }

    getInventoryById(id: number): Observable<CamInventory> {
        return this.http.get<CamInventory>(`${this.apiUrl}/${id}`);
    }

    getImportHistory(): Observable<CamImportHistory[]> {
        return this.http.get<CamImportHistory[]>(`${this.apiUrl}/history`);
    }

    importCam(inventory: CamInventory): Observable<CamInventory> {
        return this.http.post<CamInventory>(`${this.apiUrl}/import`, inventory);
    }

    exportCam(id: number, amount: number): Observable<CamInventory> {
        return this.http.post<CamInventory>(`${this.apiUrl}/${id}/export?amount=${amount}`, {});
    }

    deleteInventory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
