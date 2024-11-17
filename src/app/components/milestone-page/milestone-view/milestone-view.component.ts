import { Component, OnInit } from '@angular/core'
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component'
import { MilestoneTableComponent } from '../milestone-table/milestone-table.component'
import { MilestoneListComponent } from '../milestone-list/milestone-list.component'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { MatIconModule } from '@angular/material/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ActivatedRoute } from '@angular/router'
import { TaskService } from 'src/app/services/task.service'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { ScrollService } from 'src/app/core/util/scroll.service'
import { CreateMilestoneModalComponent } from '../create-milestone-modal/create-milestone-modal.component'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { HttpErrorResponse } from '@angular/common/http'
import { MilestoneService } from 'src/app/services/milestone.service'

@Component({
  selector: 'app-milestone-view',
  templateUrl: './milestone-view.component.html',
  styleUrls: ['./milestone-view.component.scss'],
  standalone: true,
  imports: [FilterBarComponent, MilestoneTableComponent, MilestoneListComponent, NzButtonModule, MatIconModule, NzModalModule],
})
export class MilestoneViewComponent implements OnInit {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()
  projectId = ''
  milestoneList: Milestone[] = []
  size: number = 12
  page: number = 1
  total: number = 0 //Total of tasks (filter or not)
  isFetchAllTaskLoading: boolean = false

  constructor(
    private viewMode: ViewModeConfigService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private taskService: TaskService,
    private milestoneService: MilestoneService,
    private antdNoti: AntdNotificationService,
    private scrollService: ScrollService
  ) {}

  openCreateTaskModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Tác Vụ Mới',
      nzContent: CreateMilestoneModalComponent,
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
    this.milestoneService.getMilestones(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val) => {
          if (isDesktop) {
            this.milestoneList = val.data
          } else {
            this.milestoneList = [...this.milestoneList, ...val.data]
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
