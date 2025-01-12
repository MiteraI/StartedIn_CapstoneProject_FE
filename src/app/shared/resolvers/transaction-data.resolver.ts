import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, first, of } from 'rxjs';
import { TransactionModel } from '../models/transaction/transaction.model';
import { TransactionService } from 'src/app/services/transaction.service';

export const TransactionDataResolver: ResolveFn<TransactionModel | null> = (route, state) => {
  const transactionService = inject(TransactionService);
  const projectId = route.parent?.paramMap.get('id');
  if (projectId) {
    return transactionService
      .getTransaction(route.paramMap.get('transactionId')!, projectId)
      .pipe(
        first(),
        catchError(error => {
          return of(null);
        })
      )
  } else {
    return transactionService
      .getSelfTransaction(route.paramMap.get('transactionId')!)
      .pipe(
        first(),
        catchError(error => {
          return of(null);
        })
      )
  }
};
