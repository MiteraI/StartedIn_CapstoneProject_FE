import { Component, Input, OnInit } from '@angular/core'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { finalize } from 'rxjs'
import { TaskService } from 'src/app/services/task.service'
import { TaskHistory } from 'src/app/shared/models/task-history/task-history.model'

@Component({
  selector: 'app-task-history-list',
  templateUrl: './task-history-list.component.html',
  styleUrls: ['./task-history-list.component.scss'],
  standalone: true,
  imports: [NzSpinModule],
})
export class TaskHistoryListComponent implements OnInit {
  @Input() set isCollasped(isCollapsed: boolean) {
    if (!isCollapsed) {
      //not collasped = seeing
      if (this.isHistoryFetched) return
      this.isHistoryFetched = true
      // fetch history
      this.fetchTaskHistory()
    }
  }
  @Input({ required: true }) projectId: string = ''

  isHistoryFetched: boolean = false
  taskHistories: TaskHistory[] = []

  page = 1
  size = 10
  isLoading = false

  constructor(private taskService: TaskService) {}

  ngOnInit() {}

  fetchTaskHistory() {
    this.isLoading = true
    this.taskService
      .getTaskHistory(this.projectId, this.page, this.size)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((val) => {
        this.taskHistories = [...this.taskHistories, ...val.data]
      })
  }
}
