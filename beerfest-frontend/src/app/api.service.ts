import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:4000/api'; // adjust if needed

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{ ok: boolean; token: string; username: string }>(
      `${API}/auth/login`,
      { username, password }
    );
  }
  changePassword(current: string, next: string) {
    return this.http.post<{ ok: boolean; msg?: string }>(
      `${API}/auth/change-password`,
      { current, next }
    );
  }
  addUser(username: string, password: string) {
    return this.http.post<{ ok: boolean; msg?: string }>(
      `${API}/admin/add-user`,
      { username, password }
    );
  }
  update(item: '500' | '250' | 'bottle', delta: -1 | 1) {
    return this.http.post<{ ok: boolean }>(`${API}/sales/update`, {
      item,
      delta,
    });
  }
  myTotals() {
    return this.http.get<{
      ok: boolean;
      totals: {
        qty_500: number;
        qty_250: number;
        qty_bottle: number;
        grand: number;
      };
    }>(`${API}/sales/my-totals`);
  }
  overview() {
    return this.http.get<{ ok: boolean; rows: any[]; grand: any }>(
      `${API}/sales/overview`
    );
  }
}
