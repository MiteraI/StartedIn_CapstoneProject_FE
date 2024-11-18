import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';
import { AccountService } from '../../core/auth/account.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  constructor(private accountService: AccountService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.accountService.account$.pipe(
      filter(account => account !== null),
      take(1),
      map(account => {
        if (account!.authorities.includes('User')) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
