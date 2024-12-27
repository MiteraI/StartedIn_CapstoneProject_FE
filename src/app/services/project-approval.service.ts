import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Pagination } from '../shared/models/pagination.model'
import { ProjectApprovalDetail } from '../shared/models/project-approval/project-approval-detail.model'
import { BehaviorSubject, tap } from 'rxjs'
import { CancelReasonForApproval } from '../shared/models/project-approval/project-approval-cancel.model'
import { ProjectApprovalStatus } from '../shared/enums/project-approval-status.enum'

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

  getRegisterDetail(projectId: string, approvalId: string) {
    const url = `/api/projects/${projectId}/request-register/${approvalId}`
    return this.http.get<ProjectApprovalDetail>(this.applicationConfigService.getEndpointFor(url))
  }

  getApprovals(page: number, size: number, approvalId?: string, periodFrom?: Date, periodTo?: Date, status?: ProjectApprovalStatus) {
    let params = new HttpParams()
    params = params.append('page', page)
    params = params.append('size', size)
    if (approvalId) {
      params = params.append('approvalId', approvalId)
    }
    if (periodFrom) {
      params = params.append('periodFrom', periodFrom.toISOString().split('T')[0])
    }
    if (periodTo) {
      params = params.append('periodTo', periodTo.toISOString().split('T')[0])
    }
    if (status) {
      params = params.append('status', status)
    }
    console.log(params)
    const url = `/api/approvals`

    return this.http.get<Pagination<ProjectApprovalDetail>>(this.applicationConfigService.getEndpointFor(url), { params })
  }

  approveProjectRequest(approvalId: string) {
    const url = `/api/approvals/${approvalId}/approve-project-request`
    return this.http.put(this.applicationConfigService.getEndpointFor(url), {})
  }

  rejectProjectRequest(approvalId: string, reason: CancelReasonForApproval) {
    const url = `/api/approvals/${approvalId}/reject-project-request`
    return this.http.put(this.applicationConfigService.getEndpointFor(url), reason)
  }
}
