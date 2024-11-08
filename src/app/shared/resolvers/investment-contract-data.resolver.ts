import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, first, of } from 'rxjs';
import { ContractService } from 'src/app/services/contract.service';
import { InvestmentContractDetailModel } from '../models/contract/investment-contract-detail.model';

export const InvestmentContractDataResolver: ResolveFn<InvestmentContractDetailModel | null> = (route, state) => {
  const contractService = inject(ContractService);
  return contractService
    .getInvestmentContract(route.paramMap.get('contractId')!, route.parent?.paramMap.get('id')!)
    .pipe(
      first(),
      catchError(error => {
        return of(null);
      })
    )
};
