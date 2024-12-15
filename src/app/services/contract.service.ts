import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { BehaviorSubject, map, Observable } from "rxjs";
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
import { ContractHistoryModel } from "../shared/models/contract/contract-history.model";
import { LiquidationContractDetailModel } from "../shared/models/contract/liquidation-contract-detail.model";

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  refreshContract$ = new BehaviorSubject<boolean>(true)
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  getContractListForProject(
    id: string,
    pageIndex: number,
    pageSize: number,
    contractIdNumber?: string,
    contractName?: string,
    contractType?: ContractType,
    parties?: string[],
    lastUpdatedStartDate?: Date,
    lastUpdatedEndDate?: Date,
    contractStatus?: ContractStatus
  ): Observable<SearchResponseModel<ContractListItemModel>> {
    const query = (contractIdNumber?.trim() ? `contractIdNumber=${contractIdNumber.trim()}&` : '')
      + (contractName?.trim() ? `contractName=${contractName.trim()}&` : '')
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

  getLiquidationContract(id: string, projectId: string): Observable<LiquidationContractDetailModel> {
    return this.http.get<LiquidationContractDetailModel>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/liquidation-notes/${id}`)
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

  expireContract(id: string, projectId: string): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/contracts/${id}/expiration`),
      null,
      { responseType: 'text' as 'json' }
    );
  }

  deleteContract(id: string, projectId: string): Observable<any> {
    return this.http.delete(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/contracts/${id}`),
      { responseType: 'text' as 'json' }
    );
  }

  getHistory(id: string, projectId: string): Observable<ContractHistoryModel[]> {
    return this.http.get<ContractHistoryModel[]>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/contracts/${id}/history`)
    );
  }

  addLiquidationNote(projectId: string, id: string, file: File): Observable<any> {
    const url = `/api/projects/${projectId}/contracts/${id}/liquidation-notes`;
    const formdata = new FormData();
    formdata.append('uploadFile', file);
    return this.http.post(
      this.applicationConfigService.getEndpointFor(url),
      formdata,
      { responseType: 'text' as 'json' }
    )
  }

  terminate(projectId: string, id: string, file: File): Observable<any> {
    const url = `/api/projects/${projectId}/contracts/${id}/leader-terminate`;
    const formdata = new FormData();
    formdata.append('uploadFile', file);
    return this.http.post(
      this.applicationConfigService.getEndpointFor(url),
      formdata,
      { responseType: 'text' as 'json' }
    )
  }
}
