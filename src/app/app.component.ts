import { Component } from '@angular/core'
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'
import { catchError, of, tap } from 'rxjs'
import { AuthJwtService } from './core/auth/auth-jwt.service'
import { NavigationStart, Router, RouterOutlet } from '@angular/router'
import { StateStorageService } from './core/auth/state-storage.service'
import { AccountService } from './core/auth/account.service'
import { HeaderComponent } from './layouts/header/header.component'
import { FooterComponent } from './layouts/footer/footer.component'
import { ViewModeConfigService } from './core/config/view-mode-config.service'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, RouterOutlet, HeaderComponent, FooterComponent],
})
export class AppComponent {
  title = 'StartedIn'
  hideHeader = false
  hideFooter = false
  inProjectDetails = false
  isDesktopView = false

  constructor(
    private router: Router,
    private authJwt: AuthJwtService,
    private stateStorage: StateStorageService,
    private accountService: AccountService,
    private viewMode: ViewModeConfigService,
  ) {
    if (stateStorage.getRefreshToken()) {
      authJwt
        .refreshAccess()
        .pipe(
          tap(() => accountService.identity().subscribe()),
          catchError(() => of(null))
        )
        .subscribe()
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const currentUrl = event.url
        this.hideHeader = currentUrl.includes('/login') || currentUrl.includes('/register')
        this.hideFooter = currentUrl.includes('/login') || currentUrl.includes('/register')
        this.inProjectDetails = /\/project-list\/\d+/.test(currentUrl)
      }
    })

    viewMode.isDesktopView$.subscribe((val) => {
      this.isDesktopView = val
    })
  }
}
