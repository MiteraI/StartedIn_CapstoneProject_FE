import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component'
import { MilestoneTableComponent } from '../milestone-table/milestone-table.component'
import { MilestoneListComponent } from '../milestone-list/milestone-list.component'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { MatIconModule } from '@angular/material/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { finalize, Subject, takeUntil, tap } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ActivatedRoute } from '@angular/router'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { ScrollService } from 'src/app/core/util/scroll.service'
import { CreateMilestoneModalComponent } from '../create-milestone-modal/create-milestone-modal.component'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { HttpErrorResponse } from '@angular/common/http'
import { MilestoneService } from 'src/app/services/milestone.service'
import { MilestoneFilterComponent } from '../milestone-filter/milestone-filter.component'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { CommonModule } from '@angular/common'

interface MilestoneFilterOptions {
  title?: string
  phaseId?: string
}

@Component({
  selector: 'app-milestone-view',
  templateUrl: './milestone-view.component.html',
  styleUrls: ['./milestone-view.component.scss'],
  standalone: true,
  imports: [FilterBarComponent, MilestoneTableComponent, MilestoneListComponent, NzButtonModule, MatIconModule, NzModalModule, MilestoneFilterComponent, CommonModule],
})
export class MilestoneViewComponent implements OnInit, OnDestroy {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()
  projectId = ''
  filter: MilestoneFilterOptions = {}
  @ViewChild(MilestoneFilterComponent) filterComponent!: MilestoneFilterComponent
  milestoneList: Milestone[] = []
  size: number = 12
  page: number = 1
  total: number = 0 //Total of tasks (filter or not)
  isFetchAllMilestonesLoading: boolean = false
  isLeader: boolean = false
  constructor(
    private viewMode: ViewModeConfigService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private milestoneService: MilestoneService,
    private antdNoti: AntdNotificationService,
    private scrollService: ScrollService,
    private roleService: RoleInTeamService
  ) {}

  ngOnInit() {
    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
    if (this.isDesktopView) {
      this.size = 8
    } else {
      this.size = 12
    }
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
      this.roleService.role$.subscribe((role) => {
        if (!role) return
        this.isLeader = role === TeamRole.LEADER
      })
    })
    this.fetchMilestones(this.isDesktopView)
    this.scrollService.scroll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadMore()
    })
    this.milestoneService.refreshMilestone$.pipe().subscribe(() => {
      this.fetchMilestones(this.isDesktopView)
    })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  openCreateTaskModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Cột Mốc Mới',
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px' },
      nzContent: CreateMilestoneModalComponent,
      nzData: {
        projectId: this.projectId,
      },
      nzFooter: null,
    })
  }

  onPaginationChanged(page: number) {
    this.page = page
    this.fetchMilestones(this.isDesktopView)
  }

  private fetchMilestones(isDesktop: boolean) {
    this.milestoneService
      .getMilestones(this.projectId, this.page, this.size, this.filter.title, this.filter.phaseId)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => (this.isFetchAllMilestonesLoading = true)),
        finalize(() => (this.isFetchAllMilestonesLoading = false))
      )
      .subscribe({
        next: (val) => {
          if (isDesktop) {
            this.milestoneList = val.data
          } else {
            this.milestoneList = [...this.milestoneList, ...val.data]
          }
          this.total = val.total
        },
        error: (error: HttpErrorResponse) => {
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
    if (this.isDesktopView || this.isFetchAllMilestonesLoading || this.isEndOfList) return

    this.page++
    this.fetchMilestones(false)
  }

  printSearchString = (searchString: string) => {
    console.log(searchString)
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
    this.fetchMilestones(this.isDesktopView)
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter)
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      title: searchText,
    }
    this.fetchMilestones(this.isDesktopView)
  }
}
