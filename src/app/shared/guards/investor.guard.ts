import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take, filter } from 'rxjs';
import { AccountService } from '../../core/auth/account.service';

@Injectable({
  providedIn: 'root',
})
export class InvestorGuard implements CanActivate {
  constructor(private accountService: AccountService, private router: Router) {
    accountService.identity().subscribe();
  }

  canActivate(): Observable<boolean> {
    return this.accountService.account$.pipe(
      filter(account => account !== null),
      take(1),
      map(account => {
        if (account!.authorities.includes('Investor')) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
