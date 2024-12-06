import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';
import { AccountService } from '../../core/auth/account.service';
import { Authority } from '../constants/authority.constants';
@Injectable({
  providedIn: 'root',
})
export class MentorGuard implements CanActivate {
  constructor(private accountService: AccountService, private router: Router) {
    accountService.identity().subscribe();
  }

  canActivate(): Observable<boolean> {
    return this.accountService.account$.pipe(
      filter(account => account !== null),
      take(1),
      map(account => {
        if (account!.authorities.includes(Authority.MENTOR)) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
