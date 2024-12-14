import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { TerminationRequestModel } from '../shared/models/termination-request/termination-request.model'
import { simulateGetList } from '../shared/mocks/termination-request-mock'
import { delay, of } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TerminationRequestService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(projectId: string, contractId: string, reason: string) {
    const url = `/api/projects/${projectId}/termination-requests`
    return this.http.post(
      this.applicationConfigService.getEndpointFor(url),
      { contractId, reason },
      { responseType: 'text' as 'json' }
    )
  }

  getReceivedList(projectId: string) {
    const url = `/api/projects/${projectId}/received-termination-requests`
    return of(simulateGetList(projectId)).pipe(delay(800));
    //return this.http.get<TerminationRequestModel[]>(this.applicationConfigService.getEndpointFor(url))
  }

  getSentList(projectId: string) {
    const url = `/api/projects/${projectId}/sent-termination-requests`
    return of(simulateGetList(projectId)).pipe(delay(800));
    //return this.http.get<TerminationRequestModel[]>(this.applicationConfigService.getEndpointFor(url))
  }

  get(projectId: string, id: string) {
    const url = `/api/projects/${projectId}/termination-requests/${id}`
    return this.http.get<TerminationRequestModel>(this.applicationConfigService.getEndpointFor(url))
  }

  accept(projectId: string, id: string) {
    const url = `/api/projects/${projectId}/termination-requests/${id}/accept`
    return this.http.put(
      this.applicationConfigService.getEndpointFor(url),
      null,
      { responseType: 'text' as 'json' }
    )
  }

  reject(projectId: string, id: string) {
    const url = `/api/projects/${projectId}/termination-requests/${id}/reject`
    return this.http.put(
      this.applicationConfigService.getEndpointFor(url),
      null,
      { responseType: 'text' as 'json' }
    )
  }
}
