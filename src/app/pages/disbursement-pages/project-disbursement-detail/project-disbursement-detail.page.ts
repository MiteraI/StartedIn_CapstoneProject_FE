import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DisbursementService } from 'src/app/services/disbursement.service';
import { DisbursementDetailModel } from 'src/app/shared/models/disbursement/disbursement-detail.model';
import { DisbursementStatus, DisbursementStatusLabels } from 'src/app/shared/enums/disbursement-status.enum';
import { format } from 'date-fns';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, throwError } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { TitleBarComponent } from 'src/app/layouts/title-bar/title-bar.component';

@Component({
  selector: 'app-project-disbursement-detail',
  templateUrl: './project-disbursement-detail.page.html',
  styleUrls: ['./project-disbursement-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    VndCurrencyPipe,
    NzAvatarModule,
    InitialsOnlyPipe,
    MatIconModule,
    NzModalModule,
    TitleBarComponent
  ]
})
export class ProjectDisbursementDetailPage implements OnInit {
  disbursement!: DisbursementDetailModel;
  disbursementStatuses = DisbursementStatus;
  statusLabels = DisbursementStatusLabels;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private disbursementService: DisbursementService,
    private notification: NzNotificationService
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

  canConfirm(): boolean {
    return this.disbursement.disbursementStatus === DisbursementStatus.ACCEPTED;
  }

  confirmDisbursement() {
    this.modalService.confirm({
      nzTitle: 'Xác nhận đã giải ngân',
      nzContent: `Xác nhận ${this.disbursement.investorName} đã giải ngân cho ${this.disbursement.title}?`,
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.disbursementService
          .confirmDisbursement(this.disbursement.id, this.disbursement.projectId!)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Xác nhận giải ngân thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => this.disbursement.disbursementStatus = DisbursementStatus.FINISHED);
      }
    });
  }
}
