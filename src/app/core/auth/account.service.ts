import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from '../config/application-config.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Account } from './account.model';
import { BehaviorSubject, EMPTY, Observable, catchError, tap } from 'rxjs';
import { AuthJwtService } from './auth-jwt.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private account: Account | null = null;
  private accountSubject$ = new BehaviorSubject<Account | null>(this.account);
  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
    private router: Router,
    public authJwt: AuthJwtService
  ) {}

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject$.asObservable();
  }

  get account$(): Observable<Account | null> {
    return this.accountSubject$.asObservable();
  }

  identity(): Observable<Account | null> {
    return this.fetch().pipe(
      tap((account: Account) => {
        this.authenticate(account);
      }),
      catchError(() => EMPTY)
    );
  }

  authenticate(account: Account) {
    this.account = account;
    this.accountSubject$.next(account);
    this.isAuthenticatedSubject$.next(true);
  }

  logout() {
    this.account = null;
    this.accountSubject$.next(null);
    this.isAuthenticatedSubject$.next(false);
    this.authJwt.stateStorage.clearAuthenticationToken();
    this.router.navigate(['/login']);
  }

  private fetch(): Observable<Account> {
    return this.http.get<Account>(this.applicationConfigService.getEndpointFor('/api/profile'));
  }
}
