import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ContractListItemModel } from "../shared/models/contract/contract-list-item.model";
import { ContractType } from "../shared/enums/contract-type.enum";
import { ContractStatus } from "../shared/enums/contract-status.enum";
import { ContractPartyModel } from "../shared/models/contract/contract-party.model";
import { UserProjectsModel } from "../shared/models/project/user-projects.model";

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  getContractListForProject(
    id: string,
    pageIndex: number,
    pageSize: number,
    contractName?: string,
    contractType?: ContractType,
    parties?: string[],
    lastUpdatedStartDate?: string,
    lastUpdatedEndDate?: string,
    status?: ContractStatus
  ): Observable<any> {
    const query = contractName ? `contractName=${contractName}&` : ''
      + contractName ? `contractName=${contractName}&` : ''
      + contractType ? `contractType=${contractType}&` : ''
      + parties ? `parties=${parties?.join("&parties=")}&` : ''
      + lastUpdatedStartDate ? `lastUpdatedStartDate=${lastUpdatedStartDate}&` : ''
      + lastUpdatedEndDate ? `lastUpdatedEndDate=${lastUpdatedEndDate}&` : ''
      + status ? `status=${status}&` : ''
      + `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<ContractListItemModel[]>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${id}/contracts?${query}`),
    );
  }

  getContractPartiesForProject(id: string): Observable<any> {
    return this.http.get<ContractPartyModel[]>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${id}/contract-parties`)
    );
  }

  getUserProjects(): Observable<any> {
    return this.http.get<UserProjectsModel>(this.applicationConfigService.getEndpointFor('/api/projects/user-projects'))
  }
}
