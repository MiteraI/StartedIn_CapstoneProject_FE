import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Pagination } from '../shared/models/pagination.model'
import { ProjectApprovalDetail } from '../shared/models/project-approval/project-approval-detail.model'
import { BehaviorSubject, tap } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class ProjectApprovalService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  refreshApproval$ = new BehaviorSubject<boolean>(true)

  requestApproval(projectId: string, formData: FormData) {
    const url = `/api/projects/${projectId}/request-approval`
    return this.http.post(this.applicationConfigService.getEndpointFor(url), formData)
  }

  getRegister(projectId: string) {
    const url = `/api/projects/${projectId}/request-register`
    return this.http.get<ProjectApprovalDetail[]>(this.applicationConfigService.getEndpointFor(url))
  }

  getRegisterDetail(projectId: string, approvalId: string)
  {
    const url = `/api/projects/${projectId}/request-register/${approvalId}`
    return this.http.get<ProjectApprovalDetail>(this.applicationConfigService.getEndpointFor(url))
  }

  getApprovals(page: number, size: number) {
    let params = new HttpParams()
    params = params.append('page', page)
    params = params.append('size', size)
    const url = `/api/approvals`

    return this.http.get<Pagination<ProjectApprovalDetail>>(this.applicationConfigService.getEndpointFor(url), { params })
  }

  approveProjectRequest(approvalId: string) {
    const url = `/api/approvals/${approvalId}/approve-project-request`
    return this.http.put(this.applicationConfigService.getEndpointFor(url), {})
  }

  rejectProjectRequest(approvalId: string, reason: string) {
    const url = `/api/approvals/${approvalId}/reject-project-request`
    return this.http.put(this.applicationConfigService.getEndpointFor(url), reason)
  }
}
