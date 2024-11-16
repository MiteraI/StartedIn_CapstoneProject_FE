import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { Observable } from 'rxjs'
import { ProjectMilestoneModel } from '../shared/models/milestone/milestone.model'
import { MilestoneCreateModel } from '../shared/models/milestone/milestone-create.model'

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getMilestones(projectId: string): Observable<ProjectMilestoneModel[]> {
    const url = `/api/projects/${projectId}/milestones`
    return this.http.get<ProjectMilestoneModel[]>(this.applicationConfigService.getEndpointFor(url))
  }

  createMilestone(projectId: string, milestone: MilestoneCreateModel): Observable<any> {
    const url = `/api/projects/${projectId}/milestones`
    return this.http.post<MilestoneCreateModel>(this.applicationConfigService.getEndpointFor(url), milestone)
  }
}
