import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, first, of } from 'rxjs';
import { DisbursementService } from 'src/app/services/disbursement.service';
import { DisbursementDetailModel } from '../models/disbursement/disbursement-detail.model';

export const ProjectDisbursementDataResolver: ResolveFn<DisbursementDetailModel | null> = (route, state) => {
  const disbursementService = inject(DisbursementService);
  return disbursementService
    .getProjectDisbursementDetail(route.parent?.paramMap.get('id')!, route.paramMap.get('disbursementId')!)
    .pipe(
      first(),
      catchError(error => {
        return of(null);
      })
    )
};
