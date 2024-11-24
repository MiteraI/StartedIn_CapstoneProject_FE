import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectModel } from 'src/app/shared/models/project/project.model';
import { AdminService } from 'src/app/services/admin.service';
import { ProjectStatus, ProjectStatusLabels } from 'src/app/shared/enums/project-status.enum';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-admin-project-detail',
  templateUrl: './admin-project-detail.page.html',
  styleUrls: ['./admin-project-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NzModalModule
  ]
})
export class AdminProjectDetailPage implements OnInit {
  project!: ProjectModel;
  projectStatus = ProjectStatus;
  statusLabels = ProjectStatusLabels;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private adminService: AdminService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => this.project = data['project']);
    console.log(this.project);

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
            catchError(error => {
              this.notification.error("Lỗi", "Xác nhận dự án thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.project.projectStatus = ProjectStatus.ACTIVE;
            this.notification.success('Thành công', 'Xác nhận dự án thành công', { nzDuration: 2000 });
          });
      }
    });
  }

  downloadContract(contractId: string) {
    this.adminService.getContractDownloadUrl(this.project.id, contractId)
    .pipe(
      catchError(error => {
        this.notification.error("Lỗi", "Không thể tải hợp đồng!", { nzDuration: 2000 });
        return throwError(() => new Error(error.error));
      })
    )
    .subscribe(url => window.open(url, '_blank'));
  }
}
