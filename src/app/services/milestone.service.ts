import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { BehaviorSubject, Observable } from 'rxjs'
import { Milestone } from '../shared/models/milestone/milestone.model'
import { CreateMilestone } from '../shared/models/milestone/milestone-create.model'
import { Pagination } from '../shared/models/pagination.model'
import { PhaseState } from '../shared/enums/phase-status.enum'
import { MilestoneDetails } from '../shared/models/milestone/milestone-details.model'
import { UpdateMilestone } from '../shared/models/milestone/milestone-update.model'
import { MilestoneHistory } from '../shared/models/milestone/milestone-history.model'

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getMilestones(projectId: string, page: number, size: number, title?: string, phaseId?: string, startDate?: string, endDate?: string ): Observable<Pagination<Milestone>> {
    const query = 
    (title?.trim() ? `title=${title.trim()}&` : '') 
    + (phaseId ? `phaseId=${phaseId}&` : '') 
    + (startDate ? `startDate=${startDate}&` : '') 
    + (endDate ? `endDate=${endDate}&` : '') 
    + `page=${page}&size=${size}`
    return this.http.get<Pagination<Milestone>>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones?${query}`))
  }

  getMilestoneDetail(projectId: string, milestoneId: string): Observable<MilestoneDetails> {
    return this.http.get<MilestoneDetails>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones/${milestoneId}`))
  }

  createMilestone(projectId: string, milestone: CreateMilestone): Observable<any> {
    return this.http.post<CreateMilestone>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones`), milestone)
  }

  updateMilestone(projectId: string, milestoneId: string, milestone: UpdateMilestone): Observable<any> {
    return this.http.put<UpdateMilestone>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones/${milestoneId}`), milestone)
  }

  deleteMilestone(projectId: string, milestoneId: string): Observable<any> {
    return this.http.delete(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones/${milestoneId}`))
  }

  getMilestoneHistory(projectId: string, page: number, size: number): Observable<Pagination<MilestoneHistory>> {
    return this.http.get<Pagination<MilestoneHistory>>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/milestones/history?page=${page}&size=${size}`))
  }
}
