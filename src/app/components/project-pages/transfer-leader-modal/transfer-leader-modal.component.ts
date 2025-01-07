import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { catchError, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model';
import { LeaderTransferService } from 'src/app/services/leader-transfer.service';
import { NzSelectModule } from 'ng-zorro-antd/select';

interface IModalData {
  projectId: string;
  requestId: string;
  members: TeamMemberModel[];
}

@Component({
  selector: 'app-transfer-leader-modal',
  templateUrl: './transfer-leader-modal.component.html',
  styleUrls: ['./transfer-leader-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzFormModule,
    NzSelectModule,
    NzButtonModule,
    ReactiveFormsModule,
    MatIconModule
  ]
})
export class TransferLeaderModalComponent implements OnInit {
  data: IModalData = inject(NZ_MODAL_DATA);
  transferForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private leaderTransferService: LeaderTransferService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.transferForm = this.fb.group({
      newLeaderId: ['', [Validators.required]]
    });
  }

  handleSubmit(): void {
    if (this.transferForm.invalid) return;

    this.isLoading = true;
    this.leaderTransferService
      .accept(this.data.projectId, this.data.requestId, this.transferForm.get('newLeaderId')?.value)
      .pipe(
        catchError(error => {
          this.notification.error('Lỗi', error.error || 'Chuyển giao quyền nhóm trưởng thất bại!');
          this.isLoading = false;
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(() => {
        this.notification.success('Thành công', 'Chuyển giao quyền nhóm trưởng thành công!');
        this.modalRef.close(true);
      });
  }

  closeModal(): void {
    this.modalRef.close();
  }
}
