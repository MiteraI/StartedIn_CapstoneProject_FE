import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { TaskAttachment } from '../shared/models/task-attachment/task-attachment.model'
import { NzUploadFile } from 'ng-zorro-antd/upload'

@Injectable({
  providedIn: 'root',
})
export class TaskAttachmentService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  uploadFile(projectId: string, taskId: string, file: NzUploadFile) {
    const formdata = new FormData()
    formdata.append('attachment', file as unknown as File)
    return this.http.post<TaskAttachment>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}/attachments`), formdata)
  }

  deleteAttachment(projectId: string, taskId: string, attachmentId: string) {
    return this.http.delete<void>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`))
  }
}
