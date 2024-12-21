import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { Observable } from 'rxjs'
import { AcceptInvite } from '../shared/models/recruit-invite/accept-invite.model'
import { ApplyRecruitment } from '../shared/models/recruit-invite/apply-recruitment.model'
import { Applicant } from '../shared/models/recruit-invite/applicant.model'

@Injectable({
  providedIn: 'root',
})
export class RecruitInviteService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getProjectInviteOverview(projectId: string): Observable<any> {
    return this.http.get(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/invite-overview`))
  }

  inviteMembers(projectId: string, users: string[]): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/invite`), users, { responseType: 'text' as 'json' })
  }

  acceptProjectInvite(acceptInvitation: AcceptInvite, projectId: string): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/accept-invite`), acceptInvitation, { responseType: 'text' as 'json' })
  }

  applyRecruitment(projectId: string, recruitmentId: string, data: ApplyRecruitment) {
    const formData = new FormData()
    for (const file of data.cvFiles) {
      formData.append('cvFiles', file)
    }
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitments/${recruitmentId}/apply`), formData, {
      responseType: 'text' as 'json',
    })
  }

  getRecruitmentApplications(projectId: string) {
    return this.http.get<Applicant[]>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/applications`))
  }

  acceptApplication(projectId: string, applicationId: string) {
    return this.http.patch(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/applications/${applicationId}/accept`), null, { responseType: 'text' as 'json' })
  }

  rejectApplication(projectId: string, applicationId: string) {
    return this.http.patch(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/applications/${applicationId}/reject`), null, { responseType: 'text' as 'json' })
  }
}
