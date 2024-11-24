import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, first, of } from 'rxjs';
import { ProjectModel } from '../models/project/project.model';
import { AdminService } from 'src/app/services/admin.service';

export const AdminProjectDataResolver: ResolveFn<ProjectModel | null> = (route, state) => {
  const adminService = inject(AdminService);
  const projectId = route.paramMap.get('projectId');
  if (!projectId) {
    return of(null);
  }
  return adminService
    .getProject(projectId)
    .pipe(
      first(),
      catchError(error => {
        return of(null);
      })
    )
};
