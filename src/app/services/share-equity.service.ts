import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { map, Observable } from 'rxjs'
import { ShareEquityItemModel } from '../shared/models/share-equity/share-equity-item.model'

@Injectable({
  providedIn: 'root',
})
export class ShareEquityService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  private parseNumericFields<T extends ShareEquityItemModel>(equity: T): T {
    return {
      ...equity,
      percentage: typeof equity.percentage === 'string' ? parseFloat(equity.percentage) : equity.percentage
    };
  }

  getEquities(projectId: string, date: string): Observable<ShareEquityItemModel[]> {
    const url = `/api/projects/${projectId}/share-equities?toDate=${date}`;
    return this.http
      .get<ShareEquityItemModel[]>(this.applicationConfigService.getEndpointFor(url))
      .pipe(
        map(list => list.map(equity => this.parseNumericFields(equity)))
      );
  }
}
