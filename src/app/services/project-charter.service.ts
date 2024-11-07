import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { ProjectCharterFormModel } from '../shared/models/project-charter/project-charter-create.model'
import { ProjectCharterUpdateModel } from '../shared/models/project-charter/project-charter-update.model'

@Injectable({
  providedIn: 'root',
})
export class ProjectCharterService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(projectId: string, projectCharter: ProjectCharterFormModel) {
    const url = `/api/projects/${projectId}/project-charters`
    return this.http.post(this.applicationConfigService.getEndpointFor(url), projectCharter)
  }

  get(projectId: string) {
    const url = `/api/projects/${projectId}/project-charters`
    return this.http.get(this.applicationConfigService.getEndpointFor(url))
  }

  edit(projectId: string, projectCharter:ProjectCharterUpdateModel) {
    const url = `/api/projects/${projectId}/project-charters`
    return this.http.put(this.applicationConfigService.getEndpointFor(url), projectCharter)
  }
}
