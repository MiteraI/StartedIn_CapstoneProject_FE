import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DisbursementDetailModel } from 'src/app/shared/models/disbursement/disbursement-detail.model';
import { DisbursementStatus, DisbursementStatusLabels } from 'src/app/shared/enums/disbursement-status.enum';
import { format } from 'date-fns';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { MatIconModule } from '@angular/material/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DisburseModalComponent } from 'src/app/components/disbursement-pages/disburse-modal/disburse-modal.component';
import { RejectDisbursementFormComponent } from 'src/app/components/disbursement-pages/reject-disbursement-form/reject-disbursement-form.component';
import { catchError, throwError } from 'rxjs';
import { DisbursementService } from 'src/app/services/disbursement.service';

@Component({
  selector: 'app-investor-disbursement-detail',
  templateUrl: './investor-disbursement-detail.page.html',
  styleUrls: ['./investor-disbursement-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    VndCurrencyPipe,
    NzAvatarModule,
    InitialsOnlyPipe,
    MatIconModule,
    NzModalModule,
    RouterModule
  ]
})
export class InvestorDisbursementDetailPage implements OnInit {
  disbursement!: DisbursementDetailModel;
  disbursementStatuses = DisbursementStatus;
  statusLabels = DisbursementStatusLabels;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private disbursementService: DisbursementService,
    private location: Location
  ) {}

  ngOnInit() {
    this.disbursement = this.route.snapshot.data['disbursement'];
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy');
  }

  downloadAttachment(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  canDisburse(): boolean {
    return this.disbursement.disbursementStatus === DisbursementStatus.PENDING
      || this.disbursement.disbursementStatus === DisbursementStatus.OVERDUE;
  }

  openDisburseModal() {
    this.modalService.create({
      nzTitle: 'Giải ngân',
      nzContent: DisburseModalComponent,
      nzData: this.disbursement,
      nzCancelText: 'Hủy',
      nzOnOk: (componentInstance) => {
        return componentInstance.handleConfirm();
      }
    });
  }

  openRejectModal() {
    this.modalService.create({
      nzTitle: 'Từ chối giải ngân',
      nzContent: RejectDisbursementFormComponent,
      nzData: this.disbursement,
      nzCancelText: 'Hủy',
      nzOnOk: (componentInstance) => {
        const reason = componentInstance.rejectForm.get('reason')!.value;
        this.isLoading = true;
        this.disbursementService
          .rejectDisbursement(this.disbursement.id, reason)
          .pipe(
            catchError(error => {
              this.isLoading = false;
              this.notification.error("Lỗi", "Từ chối giải ngân thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.disbursement.disbursementStatus = DisbursementStatus.REJECTED;
            this.isLoading = false;
          });
      }
    });
  }

  navigateBack() {
    this.location.back();
  }
}
