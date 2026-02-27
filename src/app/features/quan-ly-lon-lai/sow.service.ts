import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sow {
    id?: number;
    tagNumber: string;
    breed: string;
    birthDate: string; // YYYY-MM-DD
    origin: string;
    status: string;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SowService {
    // Port 8081 based on previous file change
    private apiUrl = 'http://localhost:8081/api/sows';

    constructor(private http: HttpClient) { }

    getAllSows(): Observable<Sow[]> {
        return this.http.get<Sow[]>(this.apiUrl);
    }

    getSowById(id: number): Observable<Sow> {
        return this.http.get<Sow>(`${this.apiUrl}/${id}`);
    }

    createSow(sow: Sow): Observable<Sow> {
        return this.http.post<Sow>(this.apiUrl, sow);
    }

    updateSow(id: number, sow: Sow): Observable<Sow> {
        return this.http.put<Sow>(`${this.apiUrl}/${id}`, sow);
    }

    deleteSow(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
