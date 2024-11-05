import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ContractPartyModel } from "../shared/models/contract/contract-party.model";
import { ExploreProjectsListItemModel } from "../shared/models/project/explore-projects-list-item.model";
import sampleInvestorProjects from "../shared/sampledata/sample-investor-project-list-item";
import { SearchResponseModel } from "../shared/models/search-response.model";

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  getContractPartiesForProject(id: string): Observable<any> {
    return this.http.get<ContractPartyModel[]>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${id}/contract-parties`)
    );
  }

  getProjectsToExplore(pageIndex: number, pageSize: number): Observable<any> {
    const query = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    // return this.http.get<SearchResponseModel<ExploreProjectsListItemModel>>(
    //   this.applicationConfigService.getEndpointFor(`/api/projects/explore?${query}`),
    // );
    return new BehaviorSubject<SearchResponseModel<ExploreProjectsListItemModel>>(sampleInvestorProjects).asObservable();
  }
}
