import { ResolveFn } from '@angular/router'
import { inject } from '@angular/core'
import { catchError, first, map, of } from 'rxjs'
import { MilestoneService } from 'src/app/services/milestone.service'
import { ProjectMilestoneModel } from '../models/milestone/milestone.model'

export const MilestoneDataResolver: ResolveFn<ProjectMilestoneModel[] | null> = (route, state) => {
  const milestoneService = inject(MilestoneService)
  const projectId = route.parent?.paramMap.get('id')

  if (!projectId) {
    return of(null)
  }
  return milestoneService.getMilestones(projectId).pipe(
    first(),
    catchError(() => of(null)),
    map((result) => {
      return result
    })
  )
}
