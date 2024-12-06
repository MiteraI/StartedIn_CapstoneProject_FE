import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { MatIconModule } from '@angular/material/icon';
import { LeavingRequestService } from 'src/app/services/leaving-request.service';
import { LeavingRequestModel } from 'src/app/shared/models/leaving-request/leaving-request.model';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-leaving-request-list',
  templateUrl: './leaving-request-list.component.html',
  styleUrls: ['./leaving-request-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    MatIconModule,
    NzModalModule,
    InitialsOnlyPipe,
    NzSpinModule
  ]
})
export class LeavingRequestListComponent implements OnInit {
  @Input() projectId!: string;
  requests: LeavingRequestModel[] = [];
  isLoading = false;

  constructor(
    private leavingRequestService: LeavingRequestService,
    private modalService: NzModalService,
    private notification: AntdNotificationService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.leavingRequestService.getList(this.projectId).subscribe({
      next: (response) => {
        this.requests = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.notification.openErrorNotification('Lỗi', 'Không thể tải danh sách yêu cầu rời dự án');
        this.isLoading = false;
      }
    });
  }

  acceptRequest(request: LeavingRequestModel) {
    this.modalService.confirm({
      nzTitle: `Chấp nhận yêu cầu của ${request.fullName}?`,
      nzContent: `Lý do rời dự án: ${request.reason}`,
      nzClosable: false,
      nzMaskClosable: true,
      nzOkText: 'Chấp nhận',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.leavingRequestService.accept(this.projectId, request.id).subscribe({
          next: () => {
            this.notification.openSuccessNotification('Thành công', 'Đã chấp nhận yêu cầu rời dự án');
            this.loadRequests();
          },
          error: () => {
            this.notification.openErrorNotification('Lỗi', 'Không thể chấp nhận yêu cầu rời dự án');
          }
        });
      }
    });
  }

  rejectRequest(request: LeavingRequestModel) {
    this.modalService.confirm({
      nzTitle: `Từ chối yêu cầu của ${request.fullName}?`,
      nzContent: `Lý do rời dự án: ${request.reason}`,
      nzClosable: false,
      nzMaskClosable: true,
      nzOkText: 'Từ chối',
      nzOkDanger: true,
      nzOnOk: () => {
        this.leavingRequestService.reject(this.projectId, request.id).subscribe({
          next: () => {
            this.notification.openSuccessNotification('Thành công', 'Đã từ chối yêu cầu rời dự án');
            this.loadRequests();
          },
          error: () => {
            this.notification.openErrorNotification('Lỗi', 'Không thể từ chối yêu cầu rời dự án');
          }
        });
      }
    });
  }
}
