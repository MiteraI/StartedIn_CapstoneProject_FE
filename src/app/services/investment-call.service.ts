import { Injectable } from '@angular/core'
import { InvestmentCallCreateModel } from '../shared/models/investment-call/investment-call-create.model'
import { BehaviorSubject, Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { InvestmentCallResponseDto } from '../shared/models/investment-call/investment-call-response-dto.model'

@Injectable({
  providedIn: 'root',
})
export class InvestmentCallService {
  refreshInvestmentCall$ = new BehaviorSubject<boolean>(true)

  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  createInvestmentCall(projectId: string, investmentCall: InvestmentCallCreateModel): Observable<any> {
    return this.http.post<InvestmentCallCreateModel>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/investment-call`), investmentCall)
  }

  getInvestmentCallList(projectId: string): Observable<any> {
    return this.http.get<InvestmentCallResponseDto>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/investment-calls`))
  }
}
