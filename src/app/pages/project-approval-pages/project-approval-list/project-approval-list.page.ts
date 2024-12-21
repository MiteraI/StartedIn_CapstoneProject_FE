import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { catchError, Subject, takeUntil, throwError } from "rxjs";
import { RequestApprovalModalComponent } from "src/app/components/project-approval-pages/request-approval-modal/request-approval-modal.component";
import { RoleInTeamService } from "src/app/core/auth/role-in-team.service";
import { ViewModeConfigService } from "src/app/core/config/view-mode-config.service";
import { ScrollService } from "src/app/core/util/scroll.service";
import { ViewTitleBarComponent } from "src/app/layouts/view-title-bar/view-title-bar.component";
import { ProjectApprovalService } from "src/app/services/project-approval.service";
import { ProjectApprovalStatus, ProjectApprovalStatusLabel } from "src/app/shared/enums/project-approval-status.enum";
import { TeamRole } from "src/app/shared/enums/team-role.enum";
import { ProjectRegisterModel } from "src/app/shared/models/project-approval/project-register.model";

@Component({
  selector: 'app-project-approval-list',
  templateUrl: './project-approval-list.page.html',
  styleUrls: ['./project-approval-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ViewTitleBarComponent,
    MatIconModule,
    NzSpinModule,
    NzModalModule,
    RouterModule,
    NzButtonModule
  ]
})
export class ProjectApprovalPage implements OnInit {
    projectId!: string
    approvals: ProjectRegisterModel[] =[]
    
    approvalStatuses = ProjectApprovalStatus
    statusLabels = ProjectApprovalStatusLabel

    isLoading = false
    isDesktopView = false

    isLeader = false

    private destroy$ = new Subject<void>()

    constructor(
        private route: ActivatedRoute,
        private modalService: NzModalService,
        private notification: NzNotificationService,
        private viewMode: ViewModeConfigService,
        private scrollService: ScrollService,
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
        this.getApproval();
    }
    
    getApproval() {
        this.isLoading = true
        this.projectApprovalService.getRegister(this.projectId)
        .subscribe({
            next: (response) => {
              this.approvals = response;
              this.isLoading = false;
            },
            error: (error) => {
              this.notification.error('Lỗi', 'Không thể tải danh sách đăng ký dự án', { nzDuration: 2000 });
              this.isLoading = false;
            }
        });
    }

    openRequestAppovalModal() {
        this.modalService.create({
          nzTitle: 'Yêu cầu phê duyệt',
          nzContent: RequestApprovalModalComponent,
          nzData: { projectId: this.projectId },
          nzFooter: null,
          nzWidth: '800px',
        })
      }
    getApprovalStatusLabel(type: ProjectApprovalStatus) : string {
        return ProjectApprovalStatusLabel[type]
    }
}