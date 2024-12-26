import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { MatIconModule } from '@angular/material/icon'
import { Router, RouterModule } from '@angular/router'
import { NzPaginationModule } from 'ng-zorro-antd/pagination'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ScrollService } from 'src/app/core/util/scroll.service'
import { ProjectApprovalService } from 'src/app/services/project-approval.service'
import { Pagination } from 'src/app/shared/models/pagination.model'
import { ProjectApprovalStatus, ProjectApprovalStatusLabel } from 'src/app/shared/enums/project-approval-status.enum'
import { ProjectApprovalDetail } from 'src/app/shared/models/project-approval/project-approval-detail.model'
import { AdminApprovalModalComponent } from 'src/app/components/project-approval-pages/admin-approval-modal/admin-approval-modal.component'

@Component({
  selector: 'app-admin-project-approval',
  templateUrl: './admin-project-approval.page.html',
  styleUrls: ['./admin-project-approval.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NzAvatarModule, NzModalModule, MatIconModule, RouterModule, NzPaginationModule, NzSpinModule, FilterBarComponent],
})
export class AdminProjectApprovalPage implements OnInit, OnDestroy {
  ProjectApprovalStatusLabel = ProjectApprovalStatusLabel
  ProjectApprovalStatus = ProjectApprovalStatus

  pagedApprovals: Pagination<ProjectApprovalDetail> = {
    data: [],
    page: 1,
    size: 20,
    total: 200,
  }

  isLoading = false
  isDesktopView = false
  private destroy$ = new Subject<void>()

  constructor(
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService,
    private projectApprovalService: ProjectApprovalService,
    private modalService: NzModalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.viewMode.isDesktopView$.subscribe((isDesktop) => {
      this.isDesktopView = isDesktop
    })

    this.scrollService.scroll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadMore()
    })

    this.projectApprovalService.refreshApproval$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getApproval()
    })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onPageIndexChange(index: number) {
    this.pagedApprovals.page = index
    this.getApproval()
  }

  onPageSizeChange(size: number) {
    this.pagedApprovals.size = size
    this.pagedApprovals.page = 1
    this.getApproval()
  }

  get isEndOfList(): boolean {
    return this.pagedApprovals.page * this.pagedApprovals.size >= this.pagedApprovals.total
  }

  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return

    this.pagedApprovals.page++
    this.getApproval()
  }

  getApproval() {
    this.isLoading = true
    this.projectApprovalService.getApprovals(this.pagedApprovals.page, this.pagedApprovals.size).subscribe({
      next: (response) => {
        this.pagedApprovals = response
        this.isLoading = false
        console.log('Approvals:', response)
      },
      error: (error) => {
        this.isLoading = false
      },
    })
  }

  openRequestAppovalModal(approval: ProjectApprovalDetail) {
    this.modalService.create({
      nzTitle: 'Yêu cầu phê duyệt',
      nzContent: AdminApprovalModalComponent,
      nzData: { approval },
      nzFooter: null,
      nzWidth: '800px',
    })
  }

  navigateToProjectDetail(projectId: string | undefined): void {
    if (projectId) {
      this.router.navigate(['/admin/projects', projectId])
    } else {
      console.warn('Project ID is missing. Unable to navigate.')
    }
  }
}
