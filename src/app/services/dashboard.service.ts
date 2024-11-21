import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { delay, map, Observable, of } from 'rxjs'
import { DashboardModel } from '../shared/models/dashboard/dashboard.model'

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  private parseNumericFields<T extends DashboardModel>(dashboard: T): T {
    return {
      ...dashboard,
      inAmount: typeof dashboard.inAmount === 'string' ? parseInt(dashboard.inAmount) : dashboard.inAmount,
    };
  }

  getDashboard(projectId: string): Observable<DashboardModel> {
    return of(sampleDashboardData).pipe(
      delay(1000), // Delay for 1000 milliseconds (1 second)
      map(response => this.parseNumericFields(response))
    );
    return this.http.get<DashboardModel>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/dashboard`)
    ).pipe(
      map(response => this.parseNumericFields(response))
    );
  }
}

// Sample data object
export const sampleDashboardData: DashboardModel = {
  currentBudget: 1000000000,
  inAmount: 250000000,
  outAmount: 180000000,
  remainingDisbursement: 500000000,
  disbursedAmount: 500000000,
  shareEquityPercentage: 25.5,
  milestoneProgress: [
    {
      id: "m1",
      title: "Project Planning Phase",
      progress: 100
    },
    {
      id: "m2",
      title: "Development Phase",
      progress: 75
    },
    {
      id: "m3",
      title: "Testing Phase",
      progress: 30
    }
  ],
  selfRemainingDisbursement: 150000000,
  selfDisbursedAmount: 100000000
};
