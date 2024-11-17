import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component'
import { TaskTableComponent } from '../task-table/task-table.component'
import { TaskListComponent } from '../task-list/task-list.component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { MatIconModule } from '@angular/material/icon'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal.component'
import { TaskService } from 'src/app/services/task.service'
import { Task } from 'src/app/shared/models/task/task.model'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { HttpErrorResponse } from '@angular/common/http'
import { ScrollService } from 'src/app/core/util/scroll.service'

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  imports: [FilterBarComponent, TaskTableComponent, TaskListComponent, NzButtonModule, MatIconModule, NzModalModule],
  styleUrls: ['./task-view.component.scss'],
  standalone: true,
})
export class TaskViewComponent implements OnInit, OnDestroy {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()
  projectId = ''
  taskList: Task[] = []
  size: number = 12
  page: number = 1
  total: number = 0 //Total of tasks (filter or not)
  isFetchAllTaskLoading: boolean = false

  constructor(
    private viewMode: ViewModeConfigService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private taskService: TaskService,
    private antdNoti: AntdNotificationService,
    private scrollService: ScrollService
  ) {}

  openCreateTaskModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Tác Vụ Mới',
      nzContent: CreateTaskModalComponent,
      nzData: {
        projectId: this.projectId,
      },
      nzFooter: null,
    })
  }

  onPaginationChanged(page: number) {
    this.page = page
    this.isFetchAllTaskLoading = true
    this.fetchTasks(this.isDesktopView)
  }

  private fetchTasks(isDesktop: boolean) {
    //TODO: Add filter logic
    this.taskService
      .getTaskListForProject(this.projectId, this.page, this.size)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val) => {
          if (isDesktop) {
            this.taskList = val.data
          } else {
            this.taskList = [...this.taskList, ...val.data]
          }
          this.total = val.total
          this.isFetchAllTaskLoading = false
        },
        error: (error: HttpErrorResponse) => {
          this.isFetchAllTaskLoading = false
          if (error.status === 400) {
            this.antdNoti.openInfoNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
  }

  get isEndOfList(): boolean {
    return this.page * this.size >= this.total
  }

  loadMore(): void {
    //Only in mobile load more and add to the task array
    if (this.isDesktopView || this.isFetchAllTaskLoading || this.isEndOfList) return

    this.page++
    this.fetchTasks(false)
  }

  ngOnInit() {
    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
    if (this.isDesktopView) {
      this.size = 8
    } else {
      this.size = 12
    }
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })
    this.isFetchAllTaskLoading = true
    this.fetchTasks(this.isDesktopView)
    this.scrollService.scroll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadMore()
    })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  printSearchString = (searchString: string) => {
    console.log(searchString)
  }
}
