import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { TerminationRequestModel } from '../shared/models/termination-request/termination-request.model'
import { simulateGet, simulateGetList } from '../shared/mocks/termination-request-mock'
import { of } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TerminationRequestService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(projectId: string, contractId: string, reason: string) {
    const url = `/api/projects/${projectId}/contracts/${contractId}/termination-requests`
    return this.http.post(this.applicationConfigService.getEndpointFor(url), { reason })
  }

  getList(projectId: string) {
    const url = `/api/projects/${projectId}/termination-requests`
    return of(simulateGetList(projectId))
    //return this.http.get<TerminationRequestModel[]>(this.applicationConfigService.getEndpointFor(url))
  }

  get(projectId: string, id: string) {
    const url = `/api/projects/${projectId}/termination-requests/${id}`
    return this.http.get<TerminationRequestModel>(this.applicationConfigService.getEndpointFor(url))
  }
}
