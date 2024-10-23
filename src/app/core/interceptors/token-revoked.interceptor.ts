import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AccountService } from '../auth/account.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export const tokenRevokedInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (req.url.includes('/api/refresh-token')) {
    return next(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          accountService.logout();
          router.navigate(['/login']);

          snackBar.open(
            'Bạn đã đăng xuất quyền truy cập trên thiết bị khác, hãy đăng nhập lại',
            'Close',
            { duration: 3000 }
          );
        }
        return throwError(() => error);
      })
    );
  }
  return next(req);
};
