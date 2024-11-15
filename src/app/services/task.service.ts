import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { CreateTask } from '../shared/models/task/create-task.model'
import { Pagination } from '../shared/models/pagination.model'
import { TaskDetails } from '../shared/models/task/task-details.model'
import { Task } from '../shared/models/task/task.model'
import { UpdateTaskInfo } from '../shared/models/task/update-task.model'
import { UpdateTaskStatus } from '../shared/models/task/update-task-status.model'
import { UpdateTaskAssignment } from '../shared/models/task/update-task-assignment.model'
import { UpdateTaskParent } from '../shared/models/task/update-task-parent.model'
import { TaskStatus } from '../shared/enums/task-status.enum'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  createTask(projectId: string, createTask: CreateTask) {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks`), createTask)
  }

  getTaskListForProject(
    projectId: string,
    page: number,
    size: number,
    title?: string,
    status?: TaskStatus,
    late?: boolean,
    assigneeId?: string,
    milestoneId?: string
  ): Observable<Pagination<Task>> {
    const query =
      (title?.trim() ? `title=${title}&` : '') +
      (status ? `status=${status}&` : '') +
      (late !== undefined ? `late=${late}&` : '') +
      (assigneeId ? `assigneeId=${assigneeId}&` : '') +
      (milestoneId ? `milestoneId=${milestoneId}&` : '') +
      `page=${page}&size=${size}`

    return this.http.get<Pagination<Task>>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks?${query}`))
  }

  getTaskDetails(projectId: string, taskId: string) {
    return this.http.get<TaskDetails>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}`))
  }

  updateTaskInfo(projectId: string, taskId: string, updateTaskInfo: UpdateTaskInfo) {
    return this.http.put(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}`), updateTaskInfo)
  }

  updateTaskStatus(projectId: string, taskId: string, updateTaskStatus: UpdateTaskStatus) {
    return this.http.patch(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}/status`), updateTaskStatus)
  }

  updateTaskAssignment(projectId: string, taskId: string, updateTaskAssignment: UpdateTaskAssignment) {
    return this.http.patch(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}/assign`), updateTaskAssignment)
  }

  updateTaskUnassignment(projectId: string, taskId: string, updateTaskAssignment: UpdateTaskAssignment) {
    return this.http.patch(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}/unassign`), updateTaskAssignment)
  }

  updateParentTask(projectId: string, taskId: string, updateTaskParent: UpdateTaskParent) {
    return this.http.patch(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}/parent`), updateTaskParent)
  }

  deleteTask(projectId: string, taskId: string) {
    return this.http.delete(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}`))
  }
}
