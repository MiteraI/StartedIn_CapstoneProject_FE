import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { LeavingRequestModel } from '../shared/models/leaving-request/leaving-request.model'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class LeavingRequestService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(projectId: string, reason: string): Observable<any> {
    const url = `/api/projects/${projectId}/leaving-requests`;
    return this.http.post(this.applicationConfigService.getEndpointFor(url), { reason });
  }

  accept(projectId: string, id: string): Observable<any> {
    const url = `/api/projects/${projectId}/leaving-requests/${id}/accept`;
    return this.http.put(
      this.applicationConfigService.getEndpointFor(url),
      null,
      { responseType: 'text' as 'json' }
    );
  }

  reject(projectId: string, id: string): Observable<any> {
    const url = `/api/projects/${projectId}/leaving-requests/${id}/reject`;
    return this.http.put(
      this.applicationConfigService.getEndpointFor(url),
      null,
      { responseType: 'text' as 'json' }
    );
  }

  getList(projectId: string): Observable<LeavingRequestModel[]> {
    const url = `/api/projects/${projectId}/leaving-requests`;
    return this.http.get<LeavingRequestModel[]>(this.applicationConfigService.getEndpointFor(url));
  }
}
