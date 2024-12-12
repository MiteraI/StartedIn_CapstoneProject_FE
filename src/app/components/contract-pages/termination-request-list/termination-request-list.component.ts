import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { TerminationRequestService } from 'src/app/services/termination-request.service';
import { TerminationRequestModel } from 'src/app/shared/models/termination-request/termination-request.model';
import { TerminationRequestDetailModalComponent } from '../termination-request-detail-modal/termination-request-detail-modal.component';
import { TerminationStatus, TerminationStatusLabels } from 'src/app/shared/enums/termination-status.enum';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { differenceInDays } from 'date-fns'

@Component({
  selector: 'app-termination-request-list',
  templateUrl: './termination-request-list.component.html',
  styleUrls: ['./termination-request-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NzModalModule,
    NzSpinModule,
    NzSelectModule,
    FormsModule
  ]
})
export class TerminationRequestListComponent implements OnInit {
  @Input({ required: true }) projectId!: string;
  requests: TerminationRequestModel[] = [];
  filteredRequests: TerminationRequestModel[] = [];
  terminationStatus = TerminationStatus;
  statusLabels = TerminationStatusLabels;
  filterMode: number = 1;
  isLoading = false;

  constructor(
    private terminationRequestService: TerminationRequestService,
    private modalService: NzModalService,
    private notification: AntdNotificationService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.terminationRequestService.getList(this.projectId).subscribe({
      next: (response) => {
        this.requests = response;
        this.filter();
        this.isLoading = false;
      },
      error: (error) => {
        this.notification.openErrorNotification('Lỗi', 'Không thể tải danh sách yêu cầu đã gửi');
        this.isLoading = false;
      }
    });
  }

  showRequestDetail(request: TerminationRequestModel) {
    this.modalService.create({
      nzTitle: 'Chi tiết yêu cầu hủy hợp đồng',
      nzContent: TerminationRequestDetailModalComponent,
      nzFooter: null,
      nzData: { projectId: this.projectId, request: request }
    });
  }

  filter() {
    this.filteredRequests = this.requests.filter(request => {
      if (this.filterMode === 1 && differenceInDays(new Date(), new Date(request.createdTime)) > 7) {
        return false;
      } else if (this.filterMode === 2 && differenceInDays(new Date(), new Date(request.createdTime)) > 30) {
        return false;
      }
      return true;
    })
  }
}
