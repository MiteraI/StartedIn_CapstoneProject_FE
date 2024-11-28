import { ResolveFn } from '@angular/router'
import { inject } from '@angular/core'
import { catchError, first, of } from 'rxjs'
import { FullProfile } from '../models/user/full-profile.model'
import { UserService } from 'src/app/services/user.service'

export const ProfileDataResolver: ResolveFn<FullProfile | null> = (route, state) => {
  const userService = inject(UserService)

  return userService.getFullProfile().pipe(
    first(),
    catchError((error) => {
      return of(null)
    })
  )
}