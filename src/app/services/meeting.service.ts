import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { HttpClient, HttpParams } from '@angular/common/http'
import { MeetingCreateModel } from '../shared/models/meeting/meeting-create.model'
import { BehaviorSubject, Observable } from 'rxjs'
import { MeetingDetailModel } from '../shared/models/meeting/meeting-detail.model'
import { SearchResponseModel } from '../shared/models/search-response.model'
import { MeetingStatus } from '../shared/enums/meeting-status.enum'
import { MeetingFilterOptions } from '../shared/filter-options/meeting-filter-options.model'

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

  createMeeting(projectId: string, meetingDetail: FormData) {
    const url = `/api/projects/${projectId}/appointments`
    return this.http.post(this.applicationConfigService.getEndpointFor(url), meetingDetail)
  }

  getTableData(projectId: string, page: number, size: number, filterOptions: MeetingFilterOptions): Observable<SearchResponseModel<MeetingDetailModel>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString())

    // Dynamically add filter options to params
    if (filterOptions.milestoneId) {
      params = params.set('MilestoneId', filterOptions.milestoneId)
    }
    if (filterOptions.title?.trim()) {
      params = params.set('Title', filterOptions.title.trim())
    }
    if (filterOptions.fromDate) {
      params = params.set('FromDate', filterOptions.fromDate.toISOString().split('T')[0])
    }
    if (filterOptions.toDate) {
      params = params.set('ToDate', filterOptions.toDate.toISOString().split('T')[0])
    }
    if (filterOptions.meetingStatus) {
      params = params.set('MeetingStatus', filterOptions.meetingStatus.toString())
    }
    if (filterOptions.isDescending != null) {
      params = params.set('IsDescending', filterOptions.isDescending.toString())
    }
    const url = `/api/projects/${projectId}/appointments`
    return this.http.get<SearchResponseModel<MeetingDetailModel>>(this.applicationConfigService.getEndpointFor(url), { params })
  }

  cancelMeeting(projectId: string, meetingId: string) {
    const url = `/api/projects/${projectId}/appointments/${meetingId}/cancel`
    return this.http.delete(this.applicationConfigService.getEndpointFor(url), { responseType: 'text' })
  }

  startMeeting(projectId: string, meetingId: string) {
    const url = `/api/projects/${projectId}/appointments/${meetingId}/start`
    return this.http.put(this.applicationConfigService.getEndpointFor(url), '', { responseType: 'text' })
  }

  completeMeeting(projectId: string, meetingId: string) {
    const url = `/api/projects/${projectId}/appointments/${meetingId}/complete`
    return this.http.put(this.applicationConfigService.getEndpointFor(url), '', { responseType: 'text' })
  }
}
