import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { Observable } from "rxjs";
import { ContractStatus } from "../shared/enums/contract-status.enum";
import { ContractType } from "../shared/enums/contract-type.enum";
import { ContractListItemModel } from "../shared/models/contract/contract-list-item.model";
import { SearchResponseModel } from "../shared/models/search-response.model";
import { Injectable } from "@angular/core";
import { InvestmentContractCreateUpdateModel } from "../shared/models/contract/investment-contract-create-update.model";

@Injectable({
  providedIn: 'root',
})
export class ContractService {
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
    contractStatus?: ContractStatus
  ): Observable<any> {
    const query = (contractName?.trim() ? `contractName=${contractName}&` : '')
      + (contractType ? `contractTypeEnum=${contractType}&` : '')
      + (!!parties && parties.length > 0 ? `parties=${parties?.join("&parties=")}&` : '')
      + (lastUpdatedStartDate ? `lastUpdatedStartDate=${lastUpdatedStartDate}&` : '')
      + (lastUpdatedEndDate ? `lastUpdatedEndDate=${lastUpdatedEndDate}&` : '')
      + (contractStatus ? `contractStatusEnum=${contractStatus}&` : '')
      + `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<SearchResponseModel<ContractListItemModel>>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${id}/contracts?${query}`),
    );
  }

  createInvestmentContract(projectId: string, contract: InvestmentContractCreateUpdateModel): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/investment-contracts`),
      contract
    );
  }

  updateInvestmentContract(id: string, projectId: string, contract: InvestmentContractCreateUpdateModel): Observable<any> {
    return this.http.put(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/investment-contracts/${id}`),
      contract
    );
  }

  sendContract(id: string, projectId: string): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/contracts/${id}/invite`),
      null
    );
  }
}
