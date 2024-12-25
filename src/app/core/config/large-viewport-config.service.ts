import { Platform } from '@ionic/angular'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { OnDestroy } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class LargeViewportConfigService {
  private isLargeViewportSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  private largeViewportBreakpoint = 768

  constructor(private platform: Platform) {
    if (environment.production) {
      this.isLargeViewportSubject$.next(this.platform.is('desktop'))
    } else {
      this.updateViewMode()
      window.addEventListener('resize', this.updateViewMode.bind(this))
    }
  }

  private updateViewMode(): void {
    const isDesktop = window.innerWidth >= this.largeViewportBreakpoint
    this.isLargeViewportSubject$.next(isDesktop)
  }

  get isLargeViewport$(): Observable<boolean> {
    return this.isLargeViewportSubject$.asObservable()
  }
}
