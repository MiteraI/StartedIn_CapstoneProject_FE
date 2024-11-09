import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, first, of } from 'rxjs';
import { ContractService } from 'src/app/services/contract.service';
import { InternalContractDetailModel } from '../models/contract/internal-contract-detail.model';

export const InternalContractDataResolver: ResolveFn<InternalContractDetailModel | null> = (route, state) => {
  const contractService = inject(ContractService);
  return contractService
    .getInternalContract(route.paramMap.get('contractId')!, route.parent?.paramMap.get('id')!)
    .pipe(
      first(),
      catchError(error => {
        return of(null);
      })
    )
};
