import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { Observable } from 'rxjs'
import { ProjectMilestoneModel } from '../shared/models/milestone/milestone.model'

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getMilestones(projectId: string): Observable<ProjectMilestoneModel[]> {
    const url = `/api/projects/${projectId}/milestones`
    return this.http.get<ProjectMilestoneModel[]>(this.applicationConfigService.getEndpointFor(url))
  }
}
