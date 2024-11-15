import { ResolveFn } from '@angular/router'
import { inject } from '@angular/core'
import { catchError, first, map, of } from 'rxjs'
import { ProjectService } from 'src/app/services/project.service'
import { UserProjectsModel } from '../models/project/user-projects.model'

export const UserProjectDataResolver: ResolveFn<UserProjectsModel | null> = (route, state) => {
  const projectService = inject(ProjectService)
  return projectService.getUserProjects().pipe(
    first(),
    catchError((error) => {
      return of(null)
    }),
    map((result) => {
      console.log('AAAA',result)
      return result
    })
  )
}
