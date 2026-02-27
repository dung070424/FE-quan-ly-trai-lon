import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FarrowingRecord {
    id?: number;
    sowTag: string;
    farrowingDate: string; // YYYY-MM-DD
    bornAlive: number;
    stillborn: number;
    weanedPigs: number;
    weaningDate: string; // YYYY-MM-DD
    healthStatus: string;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class FarrowingRecordService {
    private apiUrl = 'http://localhost:8081/api/farrowing-records'; // Assuming backend is on 8080

    constructor(private http: HttpClient) { }

    getAllRecords(): Observable<FarrowingRecord[]> {
        return this.http.get<FarrowingRecord[]>(this.apiUrl);
    }

    getRecordById(id: number): Observable<FarrowingRecord> {
        return this.http.get<FarrowingRecord>(`${this.apiUrl}/${id}`);
    }

    createRecord(record: FarrowingRecord): Observable<FarrowingRecord> {
        return this.http.post<FarrowingRecord>(this.apiUrl, record);
    }

    updateRecord(id: number, record: FarrowingRecord): Observable<FarrowingRecord> {
        return this.http.put<FarrowingRecord>(`${this.apiUrl}/${id}`, record);
    }

    deleteRecord(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
