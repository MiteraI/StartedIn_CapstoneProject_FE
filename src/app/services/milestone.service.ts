import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { Observable } from 'rxjs'
import { Milestone } from '../shared/models/milestone/milestone.model'
import { CreateMilestone } from '../shared/models/milestone/milestone-create.model'
import { Pagination } from '../shared/models/pagination.model'

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getMilestones(projectId: string): Observable<Pagination<Milestone>> {
    const url = `/api/projects/${projectId}/milestones`
    return this.http.get<Pagination<Milestone>>(this.applicationConfigService.getEndpointFor(url))
  }

  createMilestone(projectId: string, milestone: CreateMilestone): Observable<any> {
    const url = `/api/projects/${projectId}/milestones`
    return this.http.post<CreateMilestone>(this.applicationConfigService.getEndpointFor(url), milestone)
  }
}
