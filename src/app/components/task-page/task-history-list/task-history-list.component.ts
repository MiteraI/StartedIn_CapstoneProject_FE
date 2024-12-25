import { Component, Input, OnInit } from '@angular/core'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { finalize, Subject, takeUntil } from 'rxjs'
import { ScrollService } from 'src/app/core/util/scroll.service'
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
  total = 0
  isLoading = false
  private destroy$ = new Subject<void>()

  get isEndOfList(): boolean {
    return this.page * this.size >= this.total
  }

  constructor(private taskService: TaskService, private scrollService: ScrollService) {}

  ngOnInit() {
    this.scrollService.scroll$.pipe(takeUntil(this.destroy$)).subscribe(() => {      
      this.loadMore()
    })
  }

  fetchTaskHistory() {
    this.isLoading = true
    this.taskService
      .getTaskHistory(this.projectId, this.page, this.size)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((val) => {
        this.taskHistories = [...this.taskHistories, ...val.data]
        this.total = val.total
      })
  }

  loadMore(): void {
    //Only in mobile load more and add to the task array
    if (this.isLoading || this.isEndOfList) return

    this.page++
    this.fetchTaskHistory()
  }
}
