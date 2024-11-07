import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http'
import { inject } from '@angular/core'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { catchError, filter, switchMap, take } from 'rxjs/operators'
import { Router } from '@angular/router'
import { AccountService } from '../auth/account.service'

// Create a closure to maintain state across requests
const createAuthExpiredInterceptor = () => {
  let isRefreshingToken = false
  const refreshTokenSubject = new BehaviorSubject<string | null>(null)

  const retryRequest = (request: HttpRequest<unknown>, next: HttpHandlerFn, accessToken: string): Observable<HttpEvent<unknown>> => {
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return next(clonedRequest)
  }

  const handleTokenExpiredError = (request: HttpRequest<unknown>, next: HttpHandlerFn, accountService: AccountService, router: Router): Observable<HttpEvent<unknown>> => {
    if (!isRefreshingToken) {
      isRefreshingToken = true
      refreshTokenSubject.next(null)

      return accountService.authJwt.refreshAccess().pipe(
        switchMap((response) => {
          isRefreshingToken = false
          refreshTokenSubject.next(response.accessToken)
          return retryRequest(request, next, response.accessToken)
        }),
        catchError((error) => {
          if (error.status === 401) {
            isRefreshingToken = false
            accountService.logout()
            router.navigate(['/login'])
          }
          return throwError(() => error)
        })
      )
    }

    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => retryRequest(request, next, token!))
    )
  }

  return (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const router = inject(Router)
    const accountService = inject(AccountService)

    return next(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          const isTokenExpired = error.headers.get('is-token-expired') === 'true'
          if (isTokenExpired || accountService.isAuthenticated$) {
            return handleTokenExpiredError(request, next, accountService, router)
          }
        }
        return throwError(() => error)
      })
    )
  }
}

// Export the interceptor function
export const authExpiredInterceptor: HttpInterceptorFn = createAuthExpiredInterceptor()
