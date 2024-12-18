import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { TransferMeetingModel } from '../shared/models/leader-transfer/transfer-meeting.model'
import { LeaderTransfer } from '../shared/models/leader-transfer/leader-transfer.model'

@Injectable({
  providedIn: 'root',
})
export class TerminationRequestService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(projectId: string, meeting: TransferMeetingModel) {
    const url = `/api/projects/${projectId}/leader-transfer`
    return this.http.post(
      this.applicationConfigService.getEndpointFor(url),
      meeting,
      { responseType: 'text' as 'json' }
    )
  }

  getLatest(projectId: string) {
    const url = `/api/projects/${projectId}/leader-transfer`
    return this.http.get<LeaderTransfer>(this.applicationConfigService.getEndpointFor(url))
  }

  accept(projectId: string, id: string, newLeaderId: string) {
    const url = `/api/projects/${projectId}/leader-transfer/${id}/accept`
    return this.http.put(
      this.applicationConfigService.getEndpointFor(url),
      { newLeaderId },
      { responseType: 'text' as 'json' }
    )
  }

  cancel(projectId: string, id: string) {
    const url = `/api/projects/${projectId}/leader-transfer/${id}/cancel`
    return this.http.put(
      this.applicationConfigService.getEndpointFor(url),
      null,
      { responseType: 'text' as 'json' }
    )
  }
}
