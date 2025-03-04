import { Component, OnInit, inject } from '@angular/core'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { ProjectService } from 'src/app/services/project.service'
import { CheckProjectClosableModel } from 'src/app/shared/models/project/check-project-closable.model'
import { CommonModule } from '@angular/common'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { Router } from '@angular/router'
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe'
import { MatIconModule } from '@angular/material/icon'
import { ContractType } from 'src/app/shared/enums/contract-type.enum'
import { NzNotificationService } from 'ng-zorro-antd/notification'

@Component({
  selector: 'app-close-project-modal',
  templateUrl: './close-project-modal.component.html',
  styleUrls: ['./close-project-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzSpinModule,
    NzButtonModule,
    VndCurrencyPipe,
    MatIconModule
  ]
})
export class CloseProjectModalComponent implements OnInit {
  readonly projectId: string = inject(NZ_MODAL_DATA);
  isLoading = true;
  checkResult!: CheckProjectClosableModel;
  canClose = false;

  constructor(
    private projectService: ProjectService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.projectService.checkProjectClosable(this.projectId).subscribe({
      next: (result) => {
        this.checkResult = result;
        this.canClose = result.disbursements.length === 0
          && result.contracts.length === 0
          && result.assets.length === 0;
        this.isLoading = false;
      },
      error: (error) => {
        this.notification.error('Lỗi', error.error || 'Không thể kiểm tra trạng thái đóng dự án', { nzDuration: 2000 });
        this.modalRef.close();
      }
    })
  }

  closeProject() {
    this.isLoading = true;
    this.projectService.closeProject(this.projectId).subscribe({
      next: () => {
        this.notification.success('Thành công', 'Đã đóng dự án', { nzDuration: 2000 });
        this.router.navigate(['/projects']);
        this.modalRef.close(true);
      },
      error: (error) => {
        this.notification.success('Lỗi', 'Không thể đóng dự án', { nzDuration: 2000 });
        this.isLoading = false;
      }
    })
  }

  cancel() {
    this.modalRef.close();
  }

  navigateToTransactions() {
    this.router.navigate(['/projects', this.projectId, 'transactions']);
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

  navigateToAssets() {
    this.router.navigate(['/projects', this.projectId, 'assets']);
    this.modalRef.close();
  }
}
