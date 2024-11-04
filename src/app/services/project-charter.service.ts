import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { ProjectCharterFormModel } from '../shared/models/project-charter/project-charter-create.model'

@Injectable({
  providedIn: 'root',
})
export class ProjectCharterService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(projectCharter: ProjectCharterFormModel) {
    return this.http.post(this.applicationConfigService.getEndpointFor('/api/projectcharter'), projectCharter)
  }
}
