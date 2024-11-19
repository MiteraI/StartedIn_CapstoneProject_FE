import { ResolveFn } from '@angular/router'
import { inject } from '@angular/core'
import { catchError, first, map, of } from 'rxjs'
import { ProjectService } from 'src/app/services/project.service'
import { ProjectOveriewModel } from '../models/project/project-overview.model'

export const ProjectOverviewDataResolver: ResolveFn<ProjectOveriewModel | null> = (route, state) => {
  const projectService = inject(ProjectService)
  const projectId = route.params['projectId']

  if (!projectId) {
    return of(null)
  }

  return projectService.getProjectOverview(projectId).pipe(
    first(),
    catchError((error) => {
      console.error('Error loading project overview:', error)
      return of(null)
    })
  )
}
