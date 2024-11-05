import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { DealOfferCreateModel } from "../shared/models/deal-offer/deal-offer-create.model";
import { SearchResponseModel } from "../shared/models/search-response.model";
import { InvestorDealItem } from "../shared/models/deal-offer/investor-deal-item.model";
import { DealStatus } from "../shared/enums/deal-status.enum";
import sampleInvestorDeals from "../shared/sampledata/sample-investor-deals";

@Injectable({
  providedIn: 'root',
})
export class DealOfferService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

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
  ): Observable<any> {
    const query = (projectName?.trim() ? `projectName=${projectName}&` : '')
      + (dealStatus ? `dealStatus=${dealStatus}&` : '')
      + (minAmount ? `minAmount=${minAmount}&` : '')
      + (maxAmount ? `maxAmount=${maxAmount}&` : '')
      + (minEquity ? `minEquity=${minEquity}&` : '')
      + (maxEquity ? `maxEquity=${maxEquity}&` : '')
      + `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    // return this.http.get<SearchResponseModel<InvestorDealItem>>(
    //   this.applicationConfigService.getEndpointFor(`/api/deal-offers?${query}`)
    // );
    return new BehaviorSubject<SearchResponseModel<InvestorDealItem>>(sampleInvestorDeals).asObservable();
  }
}
