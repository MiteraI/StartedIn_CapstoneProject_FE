import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { HttpClient } from '@angular/common/http'
import { MeetingCreateModel } from '../shared/models/meeting/meeting-create.model'
import { BehaviorSubject, Observable } from 'rxjs'
import { MeetingDetailModel } from '../shared/models/meeting/meeting-detail.model'
import { SearchResponseModel } from '../shared/models/search-response.model'

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  refreshMeeting$ = new BehaviorSubject<boolean>(true)

  getMeetingsForCalendar(projectId: string, year: number) {
    const url = `/api/projects/${projectId}/appointments/${year}`
    return this.http.get(this.applicationConfigService.getEndpointFor(url))
  }

  getMeetingDetails(projectId: string, meetingId: string): Observable<MeetingDetailModel> {
    const url = `/api/projects/${projectId}/appointments/${meetingId}`
    return this.http.get<MeetingDetailModel>(this.applicationConfigService.getEndpointFor(url))
  }

  createMeeting(projectId: string, meeting: MeetingCreateModel) {
    const url = `/api/projects/${projectId}/appointments`
    return this.http.post(this.applicationConfigService.getEndpointFor(url), meeting)
  }

  getTableData(projectId: string, page: number, size: number): Observable<SearchResponseModel<MeetingDetailModel>> {
    const url = `/api/projects/${projectId}/appointments?page=${page}&size=${size}`
    return this.http.get<SearchResponseModel<MeetingDetailModel>>(this.applicationConfigService.getEndpointFor(url))
  }

  cancelMeeting(projectId: string, meetingId: string) {
    const url = `/api/projects/${projectId}/appointments/${meetingId}/cancel`
    return this.http.delete(this.applicationConfigService.getEndpointFor(url), {})
  }
}
