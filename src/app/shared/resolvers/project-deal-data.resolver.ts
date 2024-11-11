import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, first, of } from 'rxjs';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { ProjectDealItem } from '../models/deal-offer/project-deal-item.model';

export const ProjectDealDataResolver: ResolveFn<ProjectDealItem | null> = (route, state) => {
  const dealOfferService = inject(DealOfferService);
  const dealId = route.queryParamMap.get('dealId')! || route.paramMap.get('dealId')!
  return dealOfferService
    .getDealInProject(dealId, route.parent?.paramMap.get('id')!)
    .pipe(
      first(),
      catchError(error => {
        return of(null);
      })
    )
};
