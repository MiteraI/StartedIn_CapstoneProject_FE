import { ResolveFn } from "@angular/router";
import { LiquidationContractDetailModel } from "../models/contract/liquidation-contract-detail.model";
import { inject } from "@angular/core";
import { ContractService } from "src/app/services/contract.service";
import { catchError, first, of } from "rxjs";

export const LiquidationContractDataResolver: ResolveFn<LiquidationContractDetailModel | null> = (route, state) => {
  const contractService = inject(ContractService);
  return contractService
    .getLiquidationContract(route.paramMap.get('contractId')!, route.parent?.paramMap.get('id')!)
    .pipe(
      first(),
      catchError(error => {
        return of(null);
      })
    )
};