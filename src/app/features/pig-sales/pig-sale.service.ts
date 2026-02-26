import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PigSale {
  id?: number;
  saleDate: string;
  quantity: number;
  weight: number;
  price: number;
  total: number;
  customer: string;
  note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PigSaleService {
  private apiUrl = 'http://localhost:8081/api/pig-sales'; // Tùy chỉnh URL nếu cần thiết

  constructor(private http: HttpClient) { }

  getAllPigSales(): Observable<PigSale[]> {
    // Thêm query params timestamp để tránh catch HTTP của trình duyệt/Fetch API
    return this.http.get<PigSale[]>(`${this.apiUrl}?t=${new Date().getTime()}`);
  }

  getPigSaleById(id: number): Observable<PigSale> {
    return this.http.get<PigSale>(`${this.apiUrl}/${id}`);
  }

  createPigSale(pigSale: PigSale): Observable<PigSale> {
    return this.http.post<PigSale>(this.apiUrl, pigSale);
  }

  updatePigSale(id: number, pigSale: PigSale): Observable<PigSale> {
    return this.http.put<PigSale>(`${this.apiUrl}/${id}`, pigSale);
  }

  deletePigSale(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
