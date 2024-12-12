import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { TerminationRequestService } from 'src/app/services/termination-request.service';
import { TerminationRequestModel } from 'src/app/shared/models/termination-request/termination-request.model';

interface IModalData {
  projectId: string,
  request: TerminationRequestModel
}

@Component({
  selector: 'app-termination-request-detail-modal',
  templateUrl: './termination-request-detail-modal.component.html',
  styleUrls: ['./termination-request-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NzSpinModule
  ]
})
export class TerminationRequestDetailModalComponent  implements OnInit {
  data: IModalData = inject(NZ_MODAL_DATA);
  isLoading: boolean = false;

  constructor(
    private terminationRequestService: TerminationRequestService,
    private notification: AntdNotificationService,
    private modalRef: NzModalRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadDetails();
  }

  loadDetails() {
    this.isLoading = true;
    this.terminationRequestService.get(this.data.projectId, this.data.request.id).subscribe({
      next: (response) => {
        this.data.request = {
          ...this.data.request,
          userParties: response.userParties
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.notification.openErrorNotification('Lỗi', 'Không thể tải chi tiết yêu cầu');
        this.isLoading = false;
      }
    });
  }

  redirectToUser(userId: string) {
    this.router.navigate(['/users', userId]);
    this.modalRef.close();
  }
}
