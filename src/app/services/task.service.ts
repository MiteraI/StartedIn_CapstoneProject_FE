import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { CreateTask } from '../shared/models/task/create-task.model'
import { Pagination } from '../shared/models/pagination.model'
import { TaskDetails } from '../shared/models/task/task-details.model'
import { Task } from '../shared/models/task/task.model'
import { UpdateTaskInfo } from '../shared/models/task/update-task.model'

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  createTask(projectId: string, createTask: CreateTask) {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks`), createTask)
  }

  getTaskListForProject(projectId: string) {
    return this.http.get<Pagination<Task>>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks`))
  }

  getTaskCatalog() {
    //Filter and stuff
  }

  getTaskDetails(projectId: string, taskId: string) {
    return this.http.get<TaskDetails>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}`))
  }

  updateTaskInfo(projectId: string, taskId: string, updateTaskInfo: UpdateTaskInfo) {
    return this.http.put(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/tasks/${taskId}`), updateTaskInfo)
  }
}
