import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, first, map, of } from 'rxjs';
import { ProjectModel } from '../models/project/project.model';
import { ProjectService } from 'src/app/services/project.service';

export const CreateInvestmentContractDataResolver: ResolveFn<ProjectModel | null> = (route, state) => {
  const projectService = inject(ProjectService);
  return projectService
  .getProject(route.parent?.paramMap.get('id')!)
  .pipe(
    first(),
    catchError(error => {
      return of(null);
    }),
    map(result => {
      return {
        ...result,
        remainingShares: result.totalShares * result.remainingPercentOfShares / 100
      }
    })
  )
};
