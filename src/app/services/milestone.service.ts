import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { Observable } from 'rxjs'
import { Milestone } from '../shared/models/milestone/milestone.model'
import { CreateMilestone } from '../shared/models/milestone/milestone-create.model'
import { Pagination } from '../shared/models/pagination.model'
import { PhaseState } from '../shared/enums/phase-status.enum'

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getMilestones(projectId: string, page: number, size: number, title?: string, phaseName?: PhaseState): Observable<Pagination<Milestone>> {
    const query = (title?.trim() ? `title=${title}&` : '') + (phaseName ? `phaseName=${phaseName}&` : '') + `page=${page}&size=${size}`
    return this.http.get<Pagination<Milestone>>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones?${query}`))
  }

  createMilestone(projectId: string, milestone: CreateMilestone): Observable<any> {
    console.log('Creating milestone', milestone);
    
    return this.http.post<CreateMilestone>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones`), milestone)
  }

  updateMilestone(projectId: string, milestoneId: string, milestone: CreateMilestone): Observable<any> {
    return this.http.put<CreateMilestone>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones/${milestoneId}`), milestone)
  }

  deleteMilestone(projectId: string, milestoneId: string): Observable<any> {
    return this.http.delete(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones/${milestoneId}`))
  }
}
