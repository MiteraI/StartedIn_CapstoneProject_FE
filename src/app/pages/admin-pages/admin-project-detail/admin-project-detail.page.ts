import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { ProjectModel } from 'src/app/shared/models/project/project.model'
import { AdminService } from 'src/app/services/admin.service'
import { ProjectStatus, ProjectStatusLabels } from 'src/app/shared/enums/project-status.enum'
import { catchError, throwError } from 'rxjs'
import { ProjectCharterComponent } from 'src/app/components/project-pages/project-overview/project-charter/project-charter.component'
import { ProjectApprovalDetail } from 'src/app/shared/models/project-approval/project-approval-detail.model'
import { AdminApprovalModalComponent } from 'src/app/components/project-approval-pages/admin-approval-modal/admin-approval-modal.component'

@Component({
  selector: 'app-admin-project-detail',
  templateUrl: './admin-project-detail.page.html',
  styleUrls: ['./admin-project-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, NzModalModule, ProjectCharterComponent],
})
export class AdminProjectDetailPage implements OnInit {
  project!: ProjectModel
  projectStatus = ProjectStatus
  statusLabels = ProjectStatusLabels

  constructor(private route: ActivatedRoute, private modalService: NzModalService, private adminService: AdminService, private notification: NzNotificationService) {}

  currentSelectedTab = 0
  ngOnInit() {
    this.route.data.subscribe((data) => (this.project = data['project']))
  }

  openRequestApprovalModal(approval: ProjectApprovalDetail | null): void {
    if (!approval) {
      // Log a warning or show a notification
      console.warn('Approval data is null or undefined.');
      this.notification.warning('Invalid Action', 'Approval details are missing.', { nzDuration: 3000 });
      return;
    }
  
    // Proceed with creating the modal
    this.modalService.create({
      nzTitle: 'Yêu cầu phê duyệt',
      nzContent: AdminApprovalModalComponent,
      nzData: { approval },
      nzFooter: null,
      nzWidth: '800px',
    });
  }

  verifyProject() {
    this.modalService.confirm({
      nzTitle: 'Xác nhận dự án',
      nzContent: 'Bạn có chắc chắn muốn xác nhận dự án này?',
      nzOkText: 'Xác nhận',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.adminService
          .verifyProject(this.project.id)
          .pipe(
            catchError((error) => {
              this.notification.error('Lỗi', 'Xác nhận dự án thất bại!', { nzDuration: 2000 })
              return throwError(() => new Error(error.error))
            })
          )
          .subscribe(() => {
            this.project.projectStatus = ProjectStatus.ACTIVE
            this.notification.success('Thành công', 'Xác nhận dự án thành công', { nzDuration: 2000 })
          })
      },
    })
  }
}
