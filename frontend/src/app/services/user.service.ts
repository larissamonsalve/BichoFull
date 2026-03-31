import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  name: string;
  username: string;
  balance: number;
}

export interface WalletStats {
  balance: number;
  totalWon: number;
  totalLost: number;
  totalPending: number;
  netProfit: number;
  pendingBetsCount: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/users';

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }
  
  getWallet(): Observable<WalletStats> {
    return this.http.get<WalletStats>(`${this.apiUrl}/wallet`);
  }
}