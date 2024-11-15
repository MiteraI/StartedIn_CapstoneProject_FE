import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { map, Observable } from "rxjs";
import { ContractStatus } from "../shared/enums/contract-status.enum";
import { ContractType } from "../shared/enums/contract-type.enum";
import { ContractListItemModel } from "../shared/models/contract/contract-list-item.model";
import { SearchResponseModel } from "../shared/models/search-response.model";
import { Injectable } from "@angular/core";
import { InvestmentContractCreateUpdateModel } from "../shared/models/contract/investment-contract-create-update.model";
import { ContractCreateFromDealModel } from "../shared/models/contract/contract-create-from-deal.model";
import { InvestmentContractDetailModel } from "../shared/models/contract/investment-contract-detail.model";
import { InternalContractCreateUpdateModel } from "../shared/models/contract/internal-contract-create-update.model";
import { InternalContractDetailModel } from "../shared/models/contract/internal-contract-detail.model";

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
    lastUpdatedStartDate?: Date,
    lastUpdatedEndDate?: Date,
    contractStatus?: ContractStatus
  ): Observable<SearchResponseModel<ContractListItemModel>> {
    const query = (contractName?.trim() ? `contractName=${contractName}&` : '')
      + (contractType ? `contractTypeEnum=${contractType}&` : '')
      + (!!parties && parties.length > 0 ? `parties=${parties?.join("&parties=")}&` : '')
      + (lastUpdatedStartDate ? `lastUpdatedStartDate=${lastUpdatedStartDate.toISOString().split('T')[0]}&` : '')
      + (lastUpdatedEndDate ? `lastUpdatedEndDate=${lastUpdatedEndDate.toISOString().split('T')[0]}&` : '')
      + (contractStatus ? `contractStatusEnum=${contractStatus}&` : '')
      + `page=${pageIndex}&size=${pageSize}`;
    return this.http.get<SearchResponseModel<ContractListItemModel>>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${id}/contracts?${query}`),
    );
  }

  getInvestmentContract(id: string, projectId: string): Observable<InvestmentContractDetailModel> {
    return this.http.get<InvestmentContractDetailModel>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/investment-contracts/${id}`)
    );
  }

  createInvestmentContract(projectId: string, contract: InvestmentContractCreateUpdateModel): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/investment-contracts`),
      contract
    );
  }

  createInvestmentContractFromDeal(projectId: string, contract: ContractCreateFromDealModel): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/investment-contracts/from-deal`),
      contract
    );
  }

  updateInvestmentContract(id: string, projectId: string, contract: InvestmentContractCreateUpdateModel): Observable<any> {
    return this.http.put(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/investment-contracts/${id}`),
      contract
    );
  }

  getInternalContract(id: string, projectId: string): Observable<InternalContractDetailModel> {
    return this.http.get<any>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/shares-distribution-contracts/${id}`)
    ).pipe(
      map(response => {
        return {
          ...response,
          shareEquities: response.userShareEquityInContract
        }
      })
    );
  }

  createInternalContract(projectId: string, contract: InternalContractCreateUpdateModel): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/shares-distribution-contracts`),
      contract
    );
  }

  updateInternalContract(id: string, projectId: string, contract: InternalContractCreateUpdateModel): Observable<any> {
    return this.http.put(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/shares-distribution-contracts/${id}`),
      contract
    );
  }

  sendContract(id: string, projectId: string): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/contracts/${id}/invite`),
      null
    );
  }

  downloadContract(id: string, projectId: string): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/contracts/${id}/download`),
      null
    );
  }
}
