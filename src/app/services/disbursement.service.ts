import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { SearchResponseModel } from "../shared/models/search-response.model";
import { ProjectDisbursementItemModel } from "../shared/models/disbursement/project-disbursement-item.model";
import { DisbursementStatus } from "../shared/enums/disbursement-status.enum";

@Injectable({
  providedIn: 'root',
})
export class DisbursementService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  private parseNumericFields<T extends ProjectDisbursementItemModel>(disbursement: T): T {
    return {
      ...disbursement,
      amount: typeof disbursement.amount === 'string' ? parseFloat(disbursement.amount) : disbursement.amount
    };
  }

  private parseSearchResponse<T extends ProjectDisbursementItemModel>(response: SearchResponseModel<T>): SearchResponseModel<T> {
    return {
      ...response,
      data: response.data.map(item => this.parseNumericFields(item))
    };
  }

  getDisbursementsForProject(
    projectId: string,
    pageIndex: number,
    pageSize: number,
    name?: string,
    periodFrom?: Date,
    periodTo?: Date,
    amountFrom?: number,
    amountTo?: number,
    status?: DisbursementStatus,
    investorId?: string,
    contractId?: string
  ): Observable<SearchResponseModel<ProjectDisbursementItemModel>> {
    const query = (name?.trim() ? `name=${name}&` : '')
      + (periodFrom ? `periodFrom=${periodFrom.toISOString().split('T')[0]}&` : '')
      + (periodTo ? `periodTo=${periodTo.toISOString().split('T')[0]}&` : '')
      + (amountFrom ? `amountFrom=${amountFrom}&` : '')
      + (amountTo ? `amountTo=${amountTo}&` : '')
      + (status !== undefined ? `status=${status}&` : '')
      + (investorId ? `investorId=${investorId}&` : '')
      + (contractId ? `contractId=${contractId}&` : '')
      + `pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<SearchResponseModel<ProjectDisbursementItemModel>>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/disbursements?${query}`)
    ).pipe(
      map(response => this.parseSearchResponse(response))
    );
  }
}
