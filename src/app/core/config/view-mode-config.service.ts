import { Platform } from '@ionic/angular'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { OnDestroy } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ViewModeConfigService {
  private isDesktopViewSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  private desktopBreakpoint = 768

  constructor(private platform: Platform) {
    if (environment.production) {
      this.isDesktopViewSubject$.next(this.platform.is('desktop'))
    } else {
      this.updateViewMode()
      window.addEventListener('resize', this.updateViewMode.bind(this))
    }
  }

  private updateViewMode(): void {
    const isDesktop = window.innerWidth >= this.desktopBreakpoint
    this.isDesktopViewSubject$.next(isDesktop)
  }

  get isDesktopView$(): Observable<boolean> {
    return this.isDesktopViewSubject$.asObservable()
  }
}
