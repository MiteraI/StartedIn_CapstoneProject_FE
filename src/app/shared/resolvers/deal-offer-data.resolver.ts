import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, first, of } from 'rxjs';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { ProjectDealItem } from '../models/deal-offer/project-deal-item.model';

export const DealOfferDataResolver: ResolveFn<ProjectDealItem | null> = (route, state) => {
  const dealOfferService = inject(DealOfferService);
  return dealOfferService
    .getDealInProject(route.parent?.queryParamMap.get('dealId')!, route.parent?.paramMap.get('id')!)
    .pipe(
      first(),
      catchError(error => {
        return of(null);
      })
    )
};
