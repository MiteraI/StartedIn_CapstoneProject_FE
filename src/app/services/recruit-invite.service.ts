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
}
