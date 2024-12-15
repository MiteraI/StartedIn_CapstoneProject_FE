import { Component, OnInit, inject } from '@angular/core'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { CommonModule } from '@angular/common'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { MatIconModule } from '@angular/material/icon'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { TerminationRequestService } from 'src/app/services/termination-request.service'
import { ContractService } from 'src/app/services/contract.service'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { ContractStatus } from 'src/app/shared/enums/contract-status.enum'
import { catchError, throwError } from 'rxjs'
import { ContractListItemModel } from 'src/app/shared/models/contract/contract-list-item.model'

interface IModalData {
  projectId: string;
  contractId?: string;
  isLeader?: boolean;
}

@Component({
  selector: 'app-terminate-contract-modal',
  templateUrl: './terminate-contract-modal.component.html',
  styleUrls: ['./terminate-contract-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzSpinModule,
    NzButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule
  ]
})
export class TerminateContractModalComponent implements OnInit {
  readonly data: IModalData = inject(NZ_MODAL_DATA);
  isLoading = false;
  terminateForm!: FormGroup;
  contractList: ContractListItemModel[] = [];
  pageIndex = 0;
  pageSize = 10;

  constructor(
    private terminationRequestService: TerminationRequestService,
    private contractService: ContractService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.terminateForm = this.fb.group({
      contractId: [this.data.contractId, [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.loadContracts();
  }

  submitRequest() {
    if (this.terminateForm.valid) {
      this.isLoading = true;
      if (this.data.isLeader) {
        this.contractService
          .terminate(
            this.data.projectId,
            this.terminateForm.value.contractId,
            this.terminateForm.value.reason
          ).subscribe({
            next: () => {
              this.notification.success('Thành công', 'Đã kết thúc hợp đồng', { nzDuration: 2000 });
              this.isLoading = false;
              this.modalRef.close(true);
            },
            error: (error) => {
              this.notification.error('Lỗi', 'Không thể kết thúc hợp đồng', { nzDuration: 2000 });
              this.isLoading = false;
            }
          });
      } else {
        this.terminationRequestService
          .create(
            this.data.projectId,
            this.terminateForm.value.contractId,
            this.terminateForm.value.reason
          ).subscribe({
            next: () => {
              this.notification.success('Thành công', 'Đã gửi yêu cầu kết thúc hợp đồng', { nzDuration: 2000 });
              this.isLoading = false;
              this.modalRef.close(true);
            },
            error: (error) => {
              this.notification.error('Lỗi', 'Không thể gửi yêu cầu kết thúc hợp đồng', { nzDuration: 2000 });
              this.isLoading = false;
            }
          });
      }
    }
  }

  loadContracts() {
    this.isLoading = true;
    this.pageIndex++;
    this.contractService
      .getContractListForProject(
        this.data.projectId,
        this.pageIndex,
        this.pageSize,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        ContractStatus.COMPLETED
      )
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách hợp đồng thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(response => {
        this.contractList = [...this.contractList, ...response.data];
        this.isLoading = false;
      })
  }

  cancel() {
    this.modalRef.close();
  }
}
