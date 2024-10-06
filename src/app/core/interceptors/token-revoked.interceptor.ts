import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AccountService } from '../auth/account.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class TokenRevokedInterceptor implements HttpInterceptor {
  constructor(
    private accountService: AccountService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/api/refresh-token')) {
      return next.handle(req).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              this.accountService.logout();
              this.router.navigate(['/login']);
              this.snackBar.open(
                'Bạn đã đăng xuất quyền truy cập trên thiết bị khác, hãy đăng nhập lại',
                'Close',
                { duration: 3000 }
              );
            }
          }
          return throwError(error);
        })
      );
    }
    return next.handle(req);
  }
}
