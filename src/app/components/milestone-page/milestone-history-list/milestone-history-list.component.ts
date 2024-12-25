import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { finalize, Subject, takeUntil } from 'rxjs'
import { ScrollService } from 'src/app/core/util/scroll.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { MilestoneHistory } from 'src/app/shared/models/milestone/milestone-history.model'

@Component({
  selector: 'app-milestone-history-list',
  templateUrl: './milestone-history-list.component.html',
  styleUrls: ['./milestone-history-list.component.scss'],
  standalone: true,
  imports: [NzSpinModule, CommonModule],
})
export class MilestoneHistoryListComponent implements OnInit {
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
  taskHistories: MilestoneHistory[] = []

  page = 1
  size = 10
  total = 0
  isLoading = false
  private destroy$ = new Subject<void>()

  get isEndOfList(): boolean {
    return this.page * this.size >= this.total
  }

  constructor(private milestoneService: MilestoneService, private scrollService: ScrollService) {}

  ngOnInit() {
    this.scrollService.scroll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadMore()
    })
  }

  fetchTaskHistory() {
    this.isLoading = true
    this.milestoneService
      .getMilestoneHistory(this.projectId, this.page, this.size)
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
