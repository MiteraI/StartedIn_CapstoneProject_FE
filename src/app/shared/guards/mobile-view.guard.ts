import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'

export const mobileViewGuard: CanActivateFn = (route, state) => {
  const viewMode = inject(ViewModeConfigService)
  const router = inject(Router)
  let isDesktopView: boolean = false
  viewMode.isDesktopView$.subscribe((val) => (isDesktopView = val))

  if (isDesktopView) {
    router.navigate([''])
    return false
  } else {
    return true
  }
}
