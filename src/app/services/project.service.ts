import { HttpClient, HttpHeaders } from '@angular/common/http'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ContractPartyModel } from '../shared/models/contract/contract-party.model'
import { ExploreProjectsListItemModel } from '../shared/models/project/explore-projects-list-item.model'
import { SearchResponseModel } from '../shared/models/search-response.model'
import { ProjectModel } from '../shared/models/project/project.model'
import { UserProjectsModel } from '../shared/models/project/user-projects.model'
import { TeamMemberModel } from '../shared/models/user/team-member.model'
import { ProjectOveriewModel } from '../shared/models/project/project-overview.model'
import { UserInviteModel } from '../shared/models/user/user-invite.model'

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getProject(id: string): Observable<ProjectModel> {
    return this.http.get<ProjectModel>(this.applicationConfigService.getEndpointFor(`/api/projects/${id}`))
  }

  getContractPartiesForProject(id: string): Observable<ContractPartyModel[]> {
    return this.http.get<ContractPartyModel[]>(this.applicationConfigService.getEndpointFor(`/api/projects/${id}/parties`))
  }

  getProjectsToExplore(pageIndex: number, pageSize: number): Observable<any> {
    const query = `page=${pageIndex}&size=${pageSize}`
    return this.http.get<SearchResponseModel<ExploreProjectsListItemModel>>(this.applicationConfigService.getEndpointFor(`/api/startups?${query}`))
  }

  getUserProjects(): Observable<UserProjectsModel> {
    return this.http.get<UserProjectsModel>(this.applicationConfigService.getEndpointFor('/api/projects'))
  }

  getMembers(projectId: string): Observable<TeamMemberModel[]> {
    return this.http.get<TeamMemberModel[]>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/members`))
  }

  inviteMembers(projectId: string, users: UserInviteModel[]): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/invite`),
      users,
      { responseType: 'text' as 'json' }
    )
  }

  createProject(projectForm: FormData): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor('/api/projects'), projectForm)
  }

  getProjectOverview(projectId: string): Observable<ProjectOveriewModel> {
    return this.http.get<ProjectOveriewModel>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}`))
  }
}
