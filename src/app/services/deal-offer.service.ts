import { HttpClient } from "@angular/common/http";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { DealOfferCreateModel } from "../shared/models/deal-offer/deal-offer-create.model";

@Injectable({
  providedIn: 'root',
})
export class DealOfferService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  postDealOffer(dealOffer: DealOfferCreateModel): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/deal-offer`), dealOffer);
  }
}
