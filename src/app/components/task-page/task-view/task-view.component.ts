import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { debounceTime, distinctUntilChanged, map, Subject, takeUntil, tap } from 'rxjs'
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
import { TaskStatus } from 'src/app/shared/enums/task-status.enum'
import { TaskFilterComponent } from '../task-filter/task-filter.component'
import { WebsocketService } from 'src/app/services/websocket.service'
import { createData, deleteData, updateData } from 'src/app/core/util/websocket.utils'
import { HistorySidebarComponent } from 'src/app/layouts/history-sidebar/history-sidebar.component'
import { TaskHistoryListComponent } from '../task-history-list/task-history-list.component'

interface TaskFilterOptions {
  title?: string
  assigneeId?: string
  milestoneId?: string
  status?: TaskStatus
  isLate?: boolean
  startDate?: string
  endDate?: string
  priorityOrderMode?: boolean
}

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  imports: [
    FilterBarComponent,
    TaskTableComponent,
    TaskListComponent,
    NzButtonModule,
    MatIconModule,
    NzModalModule,
    TaskFilterComponent,
    HistorySidebarComponent,
    TaskHistoryListComponent,
  ],
  styleUrls: ['./task-view.component.scss'],
  standalone: true,
})
export class TaskViewComponent implements OnInit, OnDestroy {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()
  projectId = ''
  // filter options default have start date to 2 weeks ago and priority order mode = true
  filter: TaskFilterOptions = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
    priorityOrderMode: true
  }
  @ViewChild(TaskFilterComponent) filterComponent!: TaskFilterComponent
  taskList: Task[] = []
  size: number = 12
  page: number = 1
  total: number = 0 //Total of tasks (filter or not)
  isFetchAllTaskLoading: boolean = false
  milestoneIdParam = ''
  private searchSubject = new Subject<string>()
  isHistoryCollasped: boolean = true // not collapsing => see history

  constructor(
    private viewMode: ViewModeConfigService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private taskService: TaskService,
    private antdNoti: AntdNotificationService,
    private websocketService: WebsocketService,
    private scrollService: ScrollService
  ) {}

  openCreateTaskModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Tác Vụ Mới',
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px' },
      nzContent: CreateTaskModalComponent,
      nzData: {
        projectId: this.projectId,
      },
      nzFooter: null,
    })
  }

  onPaginationChanged(page: number) {
    this.page = page
    this.fetchTasks(this.isDesktopView)
  }

  private fetchTasks(isDesktop: boolean) {
    this.isFetchAllTaskLoading = true
    this.taskService
      .getTaskListForProject(this.projectId, this.page, this.size, this.filter.title, this.filter.status, this.filter.isLate, this.filter.assigneeId, this.filter.milestoneId, this.filter.startDate, this.filter.endDate, this.filter.priorityOrderMode)
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
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
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
    this.activatedRoute.queryParams.pipe(map((params) => params['milestoneId'])).subscribe((milestoneId) => {
      this.milestoneIdParam = milestoneId || ''
      this.filter.milestoneId = this.milestoneIdParam
    })

    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
    if (this.isDesktopView) {
      this.size = 8
    } else {
      this.size = 12
    }

    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })

    this.fetchTasks(this.isDesktopView)
    this.scrollService.scroll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadMore()
    })

    this.searchSubject.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchText) => {
      this.filter = {
        ...this.filter,
        title: searchText,
      }
      this.fetchTasks(this.isDesktopView)
    })

    this.websocketService.websocketData
      .pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          if (!data) return
          switch (data.action) {
            case 'create':
              // chekc pagination is on final page and array length is not equal to size
              if (this.page * this.size >= this.total && this.taskList.length < this.size) {
                this.taskList = createData(this.taskList, data.data) as Task[]
              } else if (!this.isDesktopView) {
                // is mobile, simply append end
                this.taskList = createData(this.taskList, data.data) as Task[]
              }
              break
            case 'update':
              // check if data.id exist on current array
              if (this.taskList.find((item) => item.id === data.data.id)) {
                this.taskList = updateData(this.taskList, data.data) as Task[]
              }
              break
            case 'delete':
              if (this.page * this.size >= this.total && this.taskList.length < this.size) {
                this.taskList = deleteData(this.taskList, data.data.id) as Task[]
              } else if (!this.isDesktopView) {
                // is mobile, simply append end
                this.taskList = deleteData(this.taskList, data.data.id) as Task[]
              }
              break
          }
        })
      )
      .subscribe()
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get filterData() {
    return {
      ...this.filter,
      projectId: this.projectId,
    }
  }

  onFilterApplied(filterResult: any) {
    this.filter = { ...filterResult }
    this.page = 1
    this.fetchTasks(this.isDesktopView)
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter)
  }

  onSearch(searchText: string) {
    this.searchSubject.next(searchText)
  }
}
