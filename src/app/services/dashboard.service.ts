import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { map, Observable } from 'rxjs'
import { DashboardModel } from '../shared/models/dashboard/dashboard.model'

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  private parseNumericFields<T extends DashboardModel>(dashboard: T): T {
    return {
      ...dashboard,
      currentBudget: typeof dashboard.currentBudget === 'string' ? parseInt(dashboard.currentBudget) : dashboard.currentBudget,
      inAmount: typeof dashboard.inAmount === 'string' ? parseInt(dashboard.inAmount) : dashboard.inAmount,
      outAmount: typeof dashboard.outAmount === 'string' ? parseInt(dashboard.outAmount) : dashboard.outAmount,
      remainingDisbursement: typeof dashboard.remainingDisbursement === 'string' ? parseInt(dashboard.remainingDisbursement) : dashboard.remainingDisbursement,
      disbursedAmount: typeof dashboard.disbursedAmount === 'string' ? parseInt(dashboard.disbursedAmount) : dashboard.disbursedAmount,
      selfRemainingDisbursement: typeof dashboard.selfRemainingDisbursement === 'string' ? parseInt(dashboard.selfRemainingDisbursement) : dashboard.selfRemainingDisbursement,
      selfDisbursedAmount: typeof dashboard.selfDisbursedAmount === 'string' ? parseInt(dashboard.selfDisbursedAmount) : dashboard.selfDisbursedAmount
    };
  }

  getDashboard(projectId: string): Observable<DashboardModel> {
    return this.http.get<DashboardModel>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/dashboard`)
    ).pipe(
      map(response => this.parseNumericFields(response))
    );
  }
}
