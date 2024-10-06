import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StateStorageService {
  private accessToken = 'startedin-accessToken';
  private refreshToken = 'startedin-refreshToken';

  constructor() {}

  storeAuthenticationToken(accessToken: string, refreshToken: string): void {
    accessToken = JSON.stringify(accessToken);
    refreshToken = JSON.stringify(refreshToken);
    this.clearAuthenticationToken();

    sessionStorage.setItem(this.accessToken, accessToken);
    localStorage.setItem(this.refreshToken, refreshToken);
  }

  getAccessToken(): string {
    const accessToken = sessionStorage.getItem(this.accessToken);
    return accessToken ? (JSON.parse(accessToken) as string) : '';
  }

  getRefreshToken(): string {
    const refreshToken = localStorage.getItem(this.refreshToken);

    return refreshToken ? (JSON.parse(refreshToken) as string) : '';
  }

  setAccessToken(accessToken: string): void {
    sessionStorage.setItem(this.accessToken, accessToken);
  }

  clearAuthenticationToken(): void {
    sessionStorage.removeItem(this.accessToken);
    localStorage.removeItem(this.refreshToken);
  }
}
