import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cam {
    id?: number;
    camCode?: string;
    name: string;
    manufacturer?: string;
    expiryDate?: string;
    note?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CamService {
    private apiUrl = 'http://localhost:8081/api/cams';

    constructor(private http: HttpClient) { }

    getAllCams(): Observable<Cam[]> {
        return this.http.get<Cam[]>(this.apiUrl);
    }

    getCamById(id: number): Observable<Cam> {
        return this.http.get<Cam>(`${this.apiUrl}/${id}`);
    }

    createCam(cam: Cam): Observable<Cam> {
        return this.http.post<Cam>(this.apiUrl, cam);
    }

    updateCam(id: number, cam: Cam): Observable<Cam> {
        return this.http.put<Cam>(`${this.apiUrl}/${id}`, cam);
    }

    deleteCam(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
