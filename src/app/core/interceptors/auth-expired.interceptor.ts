import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, flatMap, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AccountService } from '../auth/account.service';

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            const isTokenExpired = error.headers.get('is-token-expired') === 'true';
            if (isTokenExpired || this.accountService.isAuthenticated$) {
              return this.handleTokenExpiredError(request, next);
            }
          }
        }
        return throwError(error);
      })
    );
  }

  private handleTokenExpiredError(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.refreshTokenSubject.next(null);

      return this.accountService.authJwt.refreshAccess().pipe(
        switchMap(response => {
          this.isRefreshingToken = false;
          this.refreshTokenSubject.next(response.accessToken);
          return this.retryRequest(request, next, response.accessToken);
        }),
        catchError(error => {
          if (this.isRefreshingToken === true) {
            this.isRefreshingToken = false;
            this.accountService.logout();
            this.router.navigate(['/login']);
          }
          return throwError(error);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(accessToken => accessToken !== null),
      flatMap(accessToken => this.retryRequest(request, next, accessToken))
    );
  }

  private retryRequest(
    request: HttpRequest<any>,
    next: HttpHandler,
    accessToken: string
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return next.handle(request);
  }
}
