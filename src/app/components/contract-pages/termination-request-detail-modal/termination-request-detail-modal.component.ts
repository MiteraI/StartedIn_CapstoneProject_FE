import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { TerminationRequestService } from 'src/app/services/termination-request.service';
import { TerminationRequestModel } from 'src/app/shared/models/termination-request/termination-request.model';

interface IModalData {
  projectId: string,
  isLeader: boolean,
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
    NzSpinModule,
    NzButtonModule
  ]
})
export class TerminationRequestDetailModalComponent {
  data: IModalData = inject(NZ_MODAL_DATA);
  isLoading: boolean = false;

  constructor(
    private terminationRequestService: TerminationRequestService,
    private notification: NzNotificationService,
    private modalRef: NzModalRef,
    private router: Router
  ) { }

  redirectToUser(userId: string) {
    this.router.navigate(['/users', userId]);
    this.modalRef.close();
  }

  acceptRequest() {
    this.isLoading = true;
    this.terminationRequestService.accept(this.data.projectId, this.data.request.id).subscribe({
      next: (response) => {
        this.notification.success('', 'Chấp nhận yêu cầu thành công', { nzDuration: 2000 });
        this.isLoading = false;
        this.modalRef.close();
      },
      error: (error) => {
        this.notification.error('Lỗi', 'Chấp nhận yêu cầu thất bại', { nzDuration: 2000 });
        this.isLoading = false;
      }
    })
  }

  rejectRequest() {
    this.isLoading = true;
    this.terminationRequestService.reject(this.data.projectId, this.data.request.id).subscribe({
      next: (response) => {
        this.notification.success('', 'Từ chối yêu cầu thành công', { nzDuration: 2000 });
        this.isLoading = false;
        this.modalRef.close();
      },
      error: (error) => {
        this.notification.error('Lỗi', 'Từ chối yêu cầu thất bại', { nzDuration: 2000 });
        this.isLoading = false;
      }
    })
  }
}
