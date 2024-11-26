import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicationConfigService } from '../core/config/application-config.service';
import { CreateComment } from '../shared/models/task-comment/task-comment-create.model';
import { Observable } from 'rxjs';
import { TaskComment } from '../shared/models/task-comment/task-comment.model';

@Injectable({
  providedIn: 'root',
})
export class TaskCommentService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  createComment(projectId: string, taskId: string, taskComment: CreateComment): Observable<TaskComment> {
    const url = `/api/projects/${projectId}/tasks/${taskId}/comments`;
    return this.http.post<TaskComment>(this.applicationConfigService.getEndpointFor(url), taskComment);
  }
}
