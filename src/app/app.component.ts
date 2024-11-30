import { Component } from '@angular/core'
import { IonApp } from '@ionic/angular/standalone'
import { catchError, of, tap } from 'rxjs'
import { AuthJwtService } from './core/auth/auth-jwt.service'
import { NavigationStart, Router, RouterOutlet } from '@angular/router'
import { StateStorageService } from './core/auth/state-storage.service'
import { AccountService } from './core/auth/account.service'
import { HeaderComponent } from './layouts/header/header.component'
import { FooterComponent } from './layouts/footer/footer.component'
import { ViewModeConfigService } from './core/config/view-mode-config.service'
import { ScrollService } from './core/util/scroll.service'

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
    private scrollService: ScrollService
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
        this.hideHeader = currentUrl.includes('/login') || currentUrl.includes('/register') || currentUrl.includes('/payment-fail') || currentUrl.includes('/payment-success')
        this.hideFooter = currentUrl.includes('/login') || currentUrl.includes('/register') || currentUrl.includes('/payment-fail') || currentUrl.includes('/payment-success')
        // workaround for now
        this.inProjectDetails = /\/projects\//.test(currentUrl) || /\/explore/.test(currentUrl)
      }
    })

    viewMode.isDesktopView$.subscribe((val) => {
      this.isDesktopView = val
    })
  }

  onScroll(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
      this.scrollService.emitScroll();
    }
  }
}
