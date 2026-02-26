import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicineInventory {
    id?: number;
    medicineId: number;
    medicineName?: string;
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

export interface MedicineImportHistory {
    id?: number;
    medicineId: number;
    medicineName?: string;
    medicineCode?: string;
    importDate?: string;
    quantity: number;
    unit?: string;
    unitPrice?: number;
    totalPrice?: number;
}

@Injectable({
    providedIn: 'root'
})
export class KhoThuocService {
    private apiUrl = 'http://localhost:8081/api/medicine-inventory';

    constructor(private http: HttpClient) { }

    getAllInventory(): Observable<MedicineInventory[]> {
        return this.http.get<MedicineInventory[]>(this.apiUrl);
    }

    getInventoryById(id: number): Observable<MedicineInventory> {
        return this.http.get<MedicineInventory>(`${this.apiUrl}/${id}`);
    }

    getImportHistory(): Observable<MedicineImportHistory[]> {
        return this.http.get<MedicineImportHistory[]>(`${this.apiUrl}/history`);
    }

    importMedicine(inventory: MedicineInventory): Observable<MedicineInventory> {
        return this.http.post<MedicineInventory>(`${this.apiUrl}/import`, inventory);
    }

    exportMedicine(id: number, amount: number): Observable<MedicineInventory> {
        return this.http.post<MedicineInventory>(`${this.apiUrl}/${id}/export?amount=${amount}`, {});
    }

    deleteInventory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
