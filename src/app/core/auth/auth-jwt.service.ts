import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StateStorageService } from './state-storage.service';
import { ApplicationConfigService } from '../config/application-config.service';
import { EMPTY, Observable, catchError, map, of, throwError } from 'rxjs';
import { Login } from '../../shared/models/login.model';

export type Token = {
  accessToken: string;
  refreshToken: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthJwtService {
  constructor(
    private http: HttpClient,
    public stateStorage: StateStorageService,
    private applicationConfig: ApplicationConfigService
  ) {}

  login(credentials: Login): Observable<void> {
    return this.http
      .post<Token>(this.applicationConfig.getEndpointFor('/api/login'), credentials)
      .pipe(map(response => this.authenticateSuccess(response)));
  }

  refreshAccess() {
    const token: Token = {
      refreshToken: this.stateStorage.getRefreshToken(),
      accessToken: '',
    };
    return this.http
      .post<Token>(this.applicationConfig.getEndpointFor('/api/refresh-token'), token)
      .pipe(
        map(response => {
          this.authenticateSuccess(response);
          return response;
        }),
        catchError(error => {
          return EMPTY;
        })
      );
  }

  private authenticateSuccess(response: Token): void {
    this.stateStorage.storeAuthenticationToken(response.accessToken, response.refreshToken);
  }
}
