import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class ProjectApprovalService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  requestApproval(projectId: string, userId: string, formData: FormData) {
    const url = `/api/projects/${projectId}/request-approval?userId=${userId}`
    return this.http.post(this.applicationConfigService.getEndpointFor(url), formData)
  }
}
