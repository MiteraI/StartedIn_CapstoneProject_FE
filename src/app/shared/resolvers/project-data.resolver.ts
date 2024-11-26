import { ResolveFn } from '@angular/router'
import { inject } from '@angular/core'
import { catchError, first, of } from 'rxjs'
import { ProjectModel } from '../models/project/project.model'
import { ProjectService } from 'src/app/services/project.service'

export const ProjectDataResolver: ResolveFn<ProjectModel | null> = (route, state) => {
  const projectService = inject(ProjectService)
  const projectId = route.parent?.paramMap.get('id')
  if (!projectId) {
    return of(null)
  }
  return projectService.getProject(projectId).pipe(
    first(),
    catchError((error) => {
      return of(null)
    })
  )
}
