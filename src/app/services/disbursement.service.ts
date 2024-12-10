import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { SearchResponseModel } from "../shared/models/search-response.model";
import { DisbursementItemModel } from "../shared/models/disbursement/disbursement-item.model";
import { DisbursementStatus } from "../shared/enums/disbursement-status.enum";
import { DisbursementDetailModel } from "../shared/models/disbursement/disbursement-detail.model";
import { DisbursementMonthlyInfoModel } from "../shared/models/disbursement/disbursement-monthly-info.model";
import { DisbursementForProjectModel } from "../shared/models/disbursement/disbursement-for-project.model";

@Injectable({
  providedIn: 'root',
})
export class DisbursementService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  private parseNumericFields<T extends DisbursementItemModel | DisbursementDetailModel>(disbursement: T): T {
    return {
      ...disbursement,
      amount: typeof disbursement.amount === 'string' ? parseFloat(disbursement.amount) : disbursement.amount
    };
  }

  private parseMonthlyInfo(info: DisbursementMonthlyInfoModel): DisbursementMonthlyInfoModel {
    return {
      ...info,
      disbursedAmount: typeof info.disbursedAmount === 'string' ? parseFloat(info.disbursedAmount) : info.disbursedAmount,
      remainingDisbursement: typeof info.remainingDisbursement === 'string' ? parseFloat(info.remainingDisbursement) : info.remainingDisbursement
    };
  }

  private parseSearchResponse<T extends DisbursementItemModel | DisbursementDetailModel>(response: SearchResponseModel<T>): SearchResponseModel<T> {
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
    contractIdNumber?: string
  ): Observable<SearchResponseModel<DisbursementItemModel>> {
    const query = (name?.trim() ? `title=${name.trim()}&` : '')
      + (periodFrom ? `periodFrom=${periodFrom.toISOString().split('T')[0]}&` : '')
      + (periodTo ? `periodTo=${periodTo.toISOString().split('T')[0]}&` : '')
      + (amountFrom ? `amountFrom=${amountFrom}&` : '')
      + (amountTo ? `amountTo=${amountTo}&` : '')
      + (status ? `disbursementStatus=${status}&` : '')
      + (investorId ? `investorId=${investorId}&` : '')
      + (contractIdNumber ? `contractIdNumber=${contractIdNumber}&` : '')
      + `page=${pageIndex}&size=${pageSize}`;

    return this.http.get<SearchResponseModel<DisbursementItemModel>>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/disbursements?${query}`)
    ).pipe(
      map(response => this.parseSearchResponse(response))
    );
  }

  confirmDisbursement(id: string, projectId: string): Observable<string> {
    return this.http.put<string>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/disbursements/${id}/confirm`),
      null,
      { responseType: 'text' as 'json' }
    );
  }

  getDisbursements(
    pageIndex: number,
    pageSize: number,
    name?: string,
    periodFrom?: Date,
    periodTo?: Date,
    amountFrom?: number,
    amountTo?: number,
    status?: DisbursementStatus,
    projectId?: string,
    contractIdNumber?: string
  ): Observable<SearchResponseModel<DisbursementItemModel>> {
    const query = (name?.trim() ? `title=${name}&` : '')
      + (periodFrom ? `periodFrom=${periodFrom.toISOString().split('T')[0]}&` : '')
      + (periodTo ? `periodTo=${periodTo.toISOString().split('T')[0]}&` : '')
      + (amountFrom ? `amountFrom=${amountFrom}&` : '')
      + (amountTo ? `amountTo=${amountTo}&` : '')
      + (status ? `disbursementStatus=${status}&` : '')
      + (projectId ? `projectId=${projectId}&` : '')
      + (contractIdNumber ? `contractIdNumber=${contractIdNumber}&` : '')
      + `page=${pageIndex}&size=${pageSize}`;

    return this.http.get<SearchResponseModel<DisbursementItemModel>>(
      this.applicationConfigService.getEndpointFor(`/api/disbursements?${query}`)
    ).pipe(
      map(response => this.parseSearchResponse(response))
    );
  }

  getPaymentUrl(id: string): Observable<string> {
    return this.http.post<string>(
      this.applicationConfigService.getEndpointFor(`/api/disbursements/${id}/payments`),
      null,
      { responseType: 'text' as 'json' }
    );
  }

  acceptDisbursement(id: string, files: File[]): Observable<string> {
    const formdata = new FormData();
    files.forEach(file => formdata.append('evidenceFiles', file));
    return this.http.post<string>(
      this.applicationConfigService.getEndpointFor(`/api/disbursements/${id}/accept`),
      formdata,
      { responseType: 'text' as 'json' }
    );
  }

  rejectDisbursement(id: string, reason: string): Observable<string> {
    return this.http.put<string>(
      this.applicationConfigService.getEndpointFor(`/api/disbursements/${id}/reject`),
      { declineReason: reason },
      { responseType: 'text' as 'json' }
    );
  }

  getInvestorDisbursementDetail(id: string): Observable<DisbursementDetailModel> {
    return this.http.get<DisbursementDetailModel>(
      this.applicationConfigService.getEndpointFor(`/api/disbursements/${id}`)
    ).pipe(
      map(disbursement => this.parseNumericFields(disbursement))
    );
  }

  getProjectDisbursementDetail(projectId: string, id: string): Observable<DisbursementDetailModel> {
    return this.http.get<DisbursementDetailModel>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/disbursements/${id}`)
    ).pipe(
      map(disbursement => this.parseNumericFields(disbursement))
    );
  }

  getDisbursementMonthlyInfo(projectId: string): Observable<DisbursementMonthlyInfoModel[]> {
    return this.http.get<DisbursementMonthlyInfoModel[]>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/disbursements/project-info`)
    ).pipe(
      map(info => info.map(item => this.parseMonthlyInfo(item)))
    );
  }

  getProjectDisbursementInfoForInvestor(
    pageIndex: number,
    pageSize: number
  ): Observable<SearchResponseModel<DisbursementForProjectModel>> {
    const query = `page=${pageIndex}&size=${pageSize}`;
    return this.http.get<SearchResponseModel<DisbursementForProjectModel>>(
      this.applicationConfigService.getEndpointFor(`/api/disbursements/investor-info?${query}`)
    ).pipe(
      map(response => ({
        ...response,
        data: response.data.map(item => ({
          ...item,
          disbursementInfo: item.disbursementInfo.map(info => this.parseMonthlyInfo(info))
        }))
      }))
    );
  }
}
