import { Injectable } from '@angular/core'
import { InvestmentCallCreateModel } from '../shared/models/investment-call/investment-call-create.model'
import { BehaviorSubject, Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { InvestmentCallResponseDto } from '../shared/models/investment-call/investment-call-response-dto.model'
import { InvestmentCallStatus } from '../shared/enums/investment-call-status.enum'
import { SearchResponseModel } from '../shared/models/search-response.model'

@Injectable({
  providedIn: 'root',
})
export class InvestmentCallService {
  refreshInvestmentCall$ = new BehaviorSubject<boolean>(true)

  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  createInvestmentCall(projectId: string, investmentCall: InvestmentCallCreateModel): Observable<any> {
    return this.http.post<InvestmentCallCreateModel>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/investment-call`), investmentCall)
  }

  getInvestmentCallList(
    id: string,
    pageIndex: number,
    pageSize: number,
    startDate?: Date,
    endDate?: Date,
    status?: InvestmentCallStatus,
    fromAmountRaised?: number,
    toAmountRaised?: number,
    fromEquityShareCall?: number,
    toEquityShareCall?: number,
    fromTargetCall?: number,
    toTargetCall?: number,
  ): Observable<SearchResponseModel<InvestmentCallResponseDto>> {
    const query = 
    (startDate ? `startDate=${startDate.toISOString().split('T')[0]}&` : '') + 
    (endDate ? `endDate=${endDate.toISOString().split('T')[0]}&` : '') + 
    (status ? `status=${status}&` : '') +
    (fromAmountRaised ? `fromAmountRaised=${fromAmountRaised}&` : '') +
    (toAmountRaised ? `toAmountRaised=${toAmountRaised}&` : '') +
    (fromEquityShareCall ? `fromEquityShareCall=${fromEquityShareCall}&` : '') +
    (toEquityShareCall ? `toEquityShareCall=${toEquityShareCall}&` : '') +
    (fromTargetCall ? `fromTargetCall=${fromTargetCall}&` : '') +
    (toTargetCall ? `toTargetCall=${toTargetCall}&` : '') +
    `page=${pageIndex}&size=${pageSize}`
    return this.http.get<SearchResponseModel<InvestmentCallResponseDto>>(this.applicationConfigService.getEndpointFor(`/api/projects/${id}/investment-calls?${query}`))
  }
}
