import { Component, OnInit, inject } from '@angular/core'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { ProjectService } from 'src/app/services/project.service'
import { CommonModule } from '@angular/common'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { Router } from '@angular/router'
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe'
import { MatIconModule } from '@angular/material/icon'
import { ContractType } from 'src/app/shared/enums/contract-type.enum'
import { CheckUserLeaveableModel } from 'src/app/shared/models/project/check-user-leaveable.model'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { LeavingRequestService } from 'src/app/services/leaving-request.service'
import { NzNotificationService } from 'ng-zorro-antd/notification'

@Component({
  selector: 'app-leave-project-modal',
  templateUrl: './leave-project-modal.component.html',
  styleUrls: ['./leave-project-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzSpinModule,
    NzButtonModule,
    VndCurrencyPipe,
    MatIconModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule
  ]
})
export class LeaveProjectModalComponent implements OnInit {
  readonly projectId: string = inject(NZ_MODAL_DATA);
  isLoading = true;
  checkResult!: CheckUserLeaveableModel;
  canLeave = false;
  leaveForm: FormGroup;

  constructor(
    private projectService: ProjectService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private router: Router,
    private fb: FormBuilder,
    private leavingRequestService: LeavingRequestService
  ) {
    this.leaveForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.projectService.checkUserLeaveable(this.projectId).subscribe({
      next: (result) => {
        this.checkResult = result;
        this.canLeave = result.contracts.length === 0
          && result.disbursements.length === 0
          && !result.requestExisted;
        this.isLoading = false;
      },
      error: (error) => {
        this.notification.error('Lỗi', error.error || 'Không thể kiểm tra trạng thái rời dự án', { nzDuration: 2000 });
        this.modalRef.close();
      }
    })
  }

  submitLeaveRequest() {
    if (this.leaveForm.valid) {
      this.isLoading = true;
      this.leavingRequestService.create(this.projectId, this.leaveForm.value.reason).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Đã gửi yêu cầu rời dự án', { nzDuration: 2000 });
          this.modalRef.close(true);
        },
        error: (error) => {
          this.notification.error('Lỗi', error.error || 'Không thể gửi yêu cầu rời dự án', { nzDuration: 2000 });
          this.isLoading = false;
        }
      });
    }
  }

  cancel() {
    this.modalRef.close();
  }

  navigateToContract(contractType: ContractType, contractId: string) {
    this.router.navigate([
      '/projects',
      this.projectId,
      contractType === ContractType.INTERNAL ? 'internal-contract' : 'investment-contract',
      contractId
    ]);
    this.modalRef.close();
  }

  navigateToDisbursement(disbursementId: string) {
    this.router.navigate(['/projects', this.projectId, 'disbursements', disbursementId]);
    this.modalRef.close();
  }
}
