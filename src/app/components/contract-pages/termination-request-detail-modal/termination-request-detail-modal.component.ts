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

  close() {
    this.modalRef.close();
  }
}
