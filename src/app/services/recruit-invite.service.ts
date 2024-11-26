import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { UserInviteModel } from '../shared/models/user/user-invite.model'
import { Observable } from 'rxjs'
import { AcceptInvite } from '../shared/models/recruit-invite/accept-invite.model'

@Injectable({
  providedIn: 'root',
})
export class RecruitInviteService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getProjectInviteOverview(projectId: string): Observable<any> {
    return this.http.get(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/invite-overview`))
  }

  inviteMembers(projectId: string, users: UserInviteModel[]): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/invite`), users, { responseType: 'text' as 'json' })
  }

  acceptProjectInvite(acceptInvitation: AcceptInvite, projectId: string): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/accept-invite`), acceptInvitation, { responseType: 'text' as 'json' })
  }

  updateProjectRecruitmentInfo(projectId: string, recruitmentInfo: any): Observable<any> {
    return this.http.put(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitment-info`), recruitmentInfo)
  }

  updateProjectRecruitmentStatus(projectId: string, status: string): Observable<any> {
    return this.http.put(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitment-status`), { status })
  }

  updateAddRecruitmentImage(projectId: string, image: any): Observable<any> {
    return this.http.put(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitment-image`), image)
  }

  updateRemoveRecruitmentImage(projectId: string): Observable<any> {
    return this.http.delete(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitment-image`))
  }
}
