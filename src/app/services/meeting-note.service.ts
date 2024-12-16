import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { Observable } from 'rxjs'
import { MeetingDetailModel } from '../shared/models/meeting/meeting-detail.model'
import { MeetingNoteDetail } from '../shared/models/meeting/meeting-note/meeting-note-detail.model'

@Injectable({
  providedIn: 'root',
})
export class MeetingNoteService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  uploadMeetingNote(projectId: string, appointmentId: string, files: FormData): Observable<MeetingNoteDetail> {
    const url = this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/appointments/${appointmentId}/meeting-note`)
    return this.http.post<MeetingNoteDetail>(url, files)
  }
}
