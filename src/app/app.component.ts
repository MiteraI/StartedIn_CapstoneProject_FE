import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { catchError, of, tap } from 'rxjs';
import { AuthJwtService } from './core/auth/auth-jwt.service';
import { NavigationEnd, Router } from '@angular/router';
import { StateStorageService } from './core/auth/state-storage.service';
import { AccountService } from './core/auth/account.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  title = 'StartedIn';
  hideHeader = false;
  hideFooter = false;

  constructor(
    private router: Router,
    private authJwt: AuthJwtService,
    private stateStorage: StateStorageService,
    private accountService: AccountService
  ) {
    if (stateStorage.getRefreshToken()) {
      authJwt
        .refreshAccess()
        .pipe(
          tap(() => accountService.identity().subscribe()),
          catchError(() => of(null))
        )
        .subscribe();
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/login') || event.url.includes('/register')) {
          this.hideHeader = true;
        } else {
          this.hideHeader = false;
        }
        if (
          event.url.includes('/login') ||
          event.url.includes('/register') ||
          event.url.includes('/project') ||
          event.url.includes('/phase')
        ) {
          this.hideFooter = true;
        } else {
          this.hideFooter = false;
        }
      }
    });
  }
}
