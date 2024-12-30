import { CommonModule } from '@angular/common'
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { MatIcon, MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { catchError, Subject, takeUntil, throwError } from 'rxjs'
import { RequestApprovalModalComponent } from 'src/app/components/project-approval-pages/request-approval-modal/request-approval-modal.component'
import { RequestRegisterDetailComponent } from 'src/app/components/project-approval-pages/request-register-detail/request-register-detail.component'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ScrollService } from 'src/app/core/util/scroll.service'
import { ViewTitleBarComponent } from 'src/app/layouts/view-title-bar/view-title-bar.component'
import { ProjectApprovalService } from 'src/app/services/project-approval.service'
import { ProjectService } from 'src/app/services/project.service'
import { ProjectApprovalStatus, ProjectApprovalStatusLabel } from 'src/app/shared/enums/project-approval-status.enum'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { ProjectApprovalDetail } from 'src/app/shared/models/project-approval/project-approval-detail.model'
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model'

@Component({
  selector: 'app-project-approval-list',
  templateUrl: './project-approval-list.page.html',
  styleUrls: ['./project-approval-list.page.scss'],
  standalone: true,
  imports: [CommonModule, ViewTitleBarComponent, MatIconModule, NzSpinModule, NzModalModule, RouterModule, NzButtonModule],
})
export class ProjectApprovalPage implements OnInit {
  projectId!: string
  approvals: ProjectApprovalDetail[] = []

  approvalStatuses = ProjectApprovalStatus
  statusLabels = ProjectApprovalStatusLabel

  isLoading = false
  isDesktopView = false

  isLeader = false

  currentProject: ProjectOveriewModel | undefined

  private destroy$ = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService,
    private projectService: ProjectService,
    private roleService: RoleInTeamService,
    private projectApprovalService: ProjectApprovalService
  ) {}
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((map) => {
      if (!map.get('id')) {
        return
      }
      this.projectId = map.get('id')!
    })
    this.viewMode.isDesktopView$.subscribe((isDesktop) => {
      this.isDesktopView = isDesktop
    })
    this.roleService.role$.subscribe((role) => {
      this.isLeader = role === TeamRole.LEADER
    })

    this.fetchCurrentProject()
    console.log(this.currentProject)
    this.projectApprovalService.refreshApproval$.subscribe(() => {
      this.getApproval()
    })
  }

  getApproval() {
    this.isLoading = true
    this.projectApprovalService.getRegister(this.projectId).subscribe({
      next: (response) => {
        this.approvals = response
        this.isLoading = false
      },
      error: (error) => {
        this.isLoading = false
      },
    })
  }

  private fetchCurrentProject() {
    this.projectService.getProjectOverview(this.projectId).subscribe((data) => {
      this.currentProject = data
    })
  }

  showRequestDetail(approval: ProjectApprovalDetail) {
    this.modalService.create({
      nzTitle: 'Yêu cầu phê duyệt',
      nzContent: RequestRegisterDetailComponent,
      nzData: { approval },
      nzFooter: null,
      nzWidth: 800,
    })
  }

  openRequestAppovalModal() {
    this.modalService.create({
      nzTitle: 'Yêu cầu phê duyệt',
      nzContent: RequestApprovalModalComponent,
      nzData: {
        projectId: this.projectId,
        currentProject: this.currentProject,
      },
      nzFooter: null,
      nzWidth: 'fit-content',
    })
  }
  getApprovalStatusLabel(type: ProjectApprovalStatus): string {
    return ProjectApprovalStatusLabel[type]
  }
}
