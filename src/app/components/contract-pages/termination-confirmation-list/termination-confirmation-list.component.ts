import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { TerminationConfirmationModel } from 'src/app/shared/models/termination-confirmation/termination-confirmation.model';
import { TerminationConfirmationService } from 'src/app/services/termination-confirmation.service';

@Component({
  selector: 'app-termination-confirmation-list',
  templateUrl: './termination-confirmation-list.component.html',
  styleUrls: ['./termination-confirmation-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NzModalModule,
    NzSpinModule
  ]
})
export class TerminationConfirmationListComponent implements OnInit {
  @Input({ required: true }) projectId!: string;
  requests: TerminationConfirmationModel[] = [];
  isLoading = false;

  constructor(
    private terminationConfirmationService: TerminationConfirmationService,
    private modalService: NzModalService,
    private notification: AntdNotificationService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.terminationConfirmationService.getList(this.projectId).subscribe({
      next: (response) => {
        this.requests = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.notification.openErrorNotification('Lỗi', 'Không thể tải danh sách yêu cầu đang chờ');
        this.isLoading = false;
      }
    });
  }

  acceptRequest(request: TerminationConfirmationModel) {
    this.modalService.confirm({
      nzTitle: `Chấp nhận yêu cầu của ${request.fromName}?`,
      nzContent: `Lý do hủy hợp đồng: ${request.reason}`,
      nzClosable: false,
      nzMaskClosable: true,
      nzOkText: 'Chấp nhận',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.terminationConfirmationService.accept(this.projectId, request.id).subscribe({
          next: () => {
            this.notification.openSuccessNotification('Thành công', 'Đã chấp nhận yêu cầu hủy hợp đồng');
            this.loadRequests();
          },
          error: () => {
            this.notification.openErrorNotification('Lỗi', 'Không thể chấp nhận yêu cầu hủy hợp đồng');
          }
        });
      }
    });
  }

  rejectRequest(request: TerminationConfirmationModel) {
    this.modalService.confirm({
      nzTitle: `Từ chối yêu cầu của ${request.fromName}?`,
      nzContent: `Lý do hủy hợp đồng: ${request.reason}`,
      nzClosable: false,
      nzMaskClosable: true,
      nzOkText: 'Từ chối',
      nzOkDanger: true,
      nzOnOk: () => {
        this.terminationConfirmationService.reject(this.projectId, request.id).subscribe({
          next: () => {
            this.notification.openSuccessNotification('Thành công', 'Đã từ chối yêu cầu hủy hợp đồng');
            this.loadRequests();
          },
          error: () => {
            this.notification.openErrorNotification('Lỗi', 'Không thể từ chối yêu cầu hủy hợp đồng');
          }
        });
      }
    });
  }
}
