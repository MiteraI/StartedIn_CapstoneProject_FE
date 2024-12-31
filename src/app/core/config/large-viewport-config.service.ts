import { Platform } from '@ionic/angular'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class LargeViewportConfigService {
  private isLargeViewportSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  // du ma thg kiet nha large la 1024px m muon lay 768 thi lay cai desktop view, sua sua cai lon
  // t ma can 768 thi da xai cai kia cmnr chu mac deo j phai tao file moi
  private largeViewportBreakpoint = 1024

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
