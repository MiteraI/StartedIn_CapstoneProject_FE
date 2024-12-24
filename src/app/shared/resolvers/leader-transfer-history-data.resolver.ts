import { ResolveFn } from '@angular/router'
import { inject } from '@angular/core'
import { catchError, first, of } from 'rxjs'
import { LeaderTransferHistoryModel } from '../models/leader-transfer/leader-transfer-history.model'
import { LeaderTransferService } from 'src/app/services/leader-transfer.service'

export const LeaderTransferHistoryDataResolver: ResolveFn<LeaderTransferHistoryModel | null> = (route, state) => {
  const transferService = inject(LeaderTransferService)

  return transferService.getDetail(route.params['transferId'], route.parent?.params['id']).pipe(
    first(),
    catchError((error) => {
      return of(null)
    })
  )
}
