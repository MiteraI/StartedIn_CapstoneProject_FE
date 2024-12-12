import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { TerminationConfirmationModel } from '../shared/models/termination-confirmation/termination-confirmation.model'

@Injectable({
  providedIn: 'root',
})
export class TerminationConfirmationService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getList(projectId: string) {
    const url = `/api/projects/${projectId}/termination-confirmations/`
    return this.http.get<TerminationConfirmationModel[]>(this.applicationConfigService.getEndpointFor(url))
  }

  accept(projectId: string, id: string) {
    const url = `/api/projects/${projectId}/termination-confirmations/${id}/accept`
    return this.http.put(
      this.applicationConfigService.getEndpointFor(url),
      null,
      { responseType: 'text' as 'json' }
    )
  }

  reject(projectId: string, id: string) {
    const url = `/api/projects/${projectId}/termination-confirmations/${id}/reject`
    return this.http.put(
      this.applicationConfigService.getEndpointFor(url),
      null,
      { responseType: 'text' as 'json' }
    )
  }
}
