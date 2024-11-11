import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, first, of } from 'rxjs';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { InvestorDealItem } from '../models/deal-offer/investor-deal-item.model';

export const InvestorDealDataResolver: ResolveFn<InvestorDealItem | null> = (route, state) => {
  const dealOfferService = inject(DealOfferService);
  const dealId = route.paramMap.get('dealId')!
  return dealOfferService
    .getDeal(dealId)
    .pipe(
      first(),
      catchError(error => {
        return of(null);
      })
    )
};
