import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import { ContractPartyModel } from "../shared/models/contract/contract-party.model";
import { ExploreProjectsListItemModel } from "../shared/models/project/explore-projects-list-item.model";
import { SearchResponseModel } from "../shared/models/search-response.model";
import { ProjectModel } from "../shared/models/project/project.model";
import { UserProjectsModel } from "../shared/models/project/user-projects.model";

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  getProject(id: string): Observable<any> {
    return this.http.get<ProjectModel>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${id}`)
    );
  }

  getContractPartiesForProject(id: string): Observable<any> {
    return this.http.get<ContractPartyModel[]>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${id}/contract-parties`)
    );
  }

  getProjectsToExplore(pageIndex: number, pageSize: number): Observable<any> {
    const query = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<SearchResponseModel<ExploreProjectsListItemModel>>(
      this.applicationConfigService.getEndpointFor(`/api/projects/explore?${query}`),
    );
  }

  getUserProjects(): Observable<any> {
    return this.http.get<UserProjectsModel>(this.applicationConfigService.getEndpointFor('/api/projects/user-projects'))
  }
}
