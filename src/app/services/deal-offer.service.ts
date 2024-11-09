import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Injectable } from "@angular/core";
import { DealOfferCreateModel } from "../shared/models/deal-offer/deal-offer-create.model";
import { SearchResponseModel } from "../shared/models/search-response.model";
import { InvestorDealItem } from "../shared/models/deal-offer/investor-deal-item.model";
import { DealStatus } from "../shared/enums/deal-status.enum";
import { ProjectDealItem } from "../shared/models/deal-offer/project-deal-item.model";

@Injectable({
  providedIn: 'root',
})
export class DealOfferService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  private parseNumericFields<T extends InvestorDealItem | ProjectDealItem>(deal: T): T {
    return {
      ...deal,
      amount: typeof deal.amount === 'string' ? parseFloat(deal.amount) : deal.amount,
      equityShareOffer: typeof deal.equityShareOffer === 'string' ? parseFloat(deal.equityShareOffer) : deal.equityShareOffer
    };
  }

  private parseSearchResponse<T extends InvestorDealItem | ProjectDealItem>(response: SearchResponseModel<T>): SearchResponseModel<T> {
    return {
      ...response,
      responseList: response.responseList.map(item => this.parseNumericFields(item))
    };
  }

  postDealOffer(dealOffer: DealOfferCreateModel): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/deal-offers`), dealOffer);
  }

  getDealList(
    pageIndex: number,
    pageSize: number,
    projectName?: string,
    dealStatus?: DealStatus,
    minAmount?: number,
    maxAmount?: number,
    minEquity?: number,
    maxEquity?: number
  ): Observable<SearchResponseModel<InvestorDealItem>> {
    const query = (projectName?.trim() ? `projectName=${projectName}&` : '')
      + (dealStatus ? `dealStatus=${dealStatus}&` : '')
      + (minAmount ? `minAmount=${minAmount}&` : '')
      + (maxAmount ? `maxAmount=${maxAmount}&` : '')
      + (minEquity ? `minEquity=${minEquity}&` : '')
      + (maxEquity ? `maxEquity=${maxEquity}&` : '')
      + `pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<SearchResponseModel<InvestorDealItem>>(
      this.applicationConfigService.getEndpointFor(`/api/deal-offers?${query}`)
    ).pipe(
      map(response => this.parseSearchResponse(response))
    );
  }

  getProjectDealList(
    projectId: string,
    pageIndex: number,
    pageSize: number,
    investorName?: string,
    dealStatus?: DealStatus,
    minAmount?: number,
    maxAmount?: number,
    minEquity?: number,
    maxEquity?: number
  ): Observable<SearchResponseModel<ProjectDealItem>> {
    const query = (investorName?.trim() ? `investorName=${investorName}&` : '')
      + (dealStatus ? `dealStatus=${dealStatus}&` : '')
      + (minAmount ? `minAmount=${minAmount}&` : '')
      + (maxAmount ? `maxAmount=${maxAmount}&` : '')
      + (minEquity ? `minEquity=${minEquity}&` : '')
      + (maxEquity ? `maxEquity=${maxEquity}&` : '')
      + `pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<SearchResponseModel<ProjectDealItem>>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/deal-offers?${query}`)
    ).pipe(
      map(response => this.parseSearchResponse(response))
    );
  }

  getDealInProject(id: string, projectId: string): Observable<ProjectDealItem> {
    return this.http.get<ProjectDealItem>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/deal-offers/${id}`)
    ).pipe(
      map(response => this.parseNumericFields(response))
    );
  }

  acceptDeal(id: string, projectId: string): Observable<any> {
    return this.http.put(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/deal-offers/${id}/accept`),
      null
    );
  }

  rejectDeal(id: string, projectId: string): Observable<any> {
    return this.http.put(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/deal-offers/${id}/reject`),
      null
    );
  }
}
