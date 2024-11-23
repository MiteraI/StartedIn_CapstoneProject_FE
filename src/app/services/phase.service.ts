import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { ApplicationConfigService } from "../core/config/application-config.service"
import { Phase } from "../shared/models/phase/phase.model"
import { Observable } from "rxjs"

@Injectable({
    providedIn: 'root',
  })
  export class PhaseService {
    constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}
  
    getPhases(projectId: string): Observable<Phase[]> {
      return this.http.get<Phase[]>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/phases`))
    }
  }