import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { InvestmentCallService } from 'src/app/services/investment-call.service'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { InvestmentCallResponseDto } from 'src/app/shared/models/investment-call/investment-call-response-dto.model'
import { InvestmentCallLabel } from 'src/app/shared/enums/investment-call-status.enum'
import { InvestmentCallStatus } from 'src/app/shared/enums/investment-call-status.enum'
import { DealStatus, DealStatusLabels } from 'src/app/shared/enums/deal-status.enum'
import { ProjectDealItem } from 'src/app/shared/models/deal-offer/project-deal-item.model'
import { DealOfferService } from 'src/app/services/deal-offer.service'
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router'
import { SearchResponseModel } from 'src/app/shared/models/search-response.model'
import { catchError, throwError } from 'rxjs'
import { NzNotificationService } from 'ng-zorro-antd/notification'

@Component({
  selector: 'app-investment-call-table',
  templateUrl: './investment-call-table.component.html',
  styleUrls: ['./investment-call-table.component.scss'],
  standalone: true,
  imports: [
    NzTableModule,
    NzDividerModule,
    MatIconModule,
    NzButtonModule,
    NzModalModule,
    CommonModule,
    NzPopconfirmModule
  ],
})
export class InvestmentCallTableComponent {
  @Input({ required: true }) projectId!: string
  @Input({ required: true }) listInvestmentCall: SearchResponseModel<InvestmentCallResponseDto> = {
    data: [],
    page: 1,
    size: 10,
    total: 0
  }
  @Output() refreshNeeded = new EventEmitter<void>()

  constructor(
    private investmentCallService: InvestmentCallService,
    private dealOfferService: DealOfferService,
    private modalService: NzModalService,
    private router: Router,
    private notification: NzNotificationService
  ) {}

  getStatusLabel(status: InvestmentCallStatus): string {
    return InvestmentCallLabel[status]
  }

  getDealStatusLabel(status: DealStatus): string {
    return DealStatusLabels[status]
  }

  acceptDeal(data: ProjectDealItem) {
    this.modalService.confirm({
      nzTitle: 'Chấp nhận thỏa thuận',
      nzContent: `Chấp nhận thỏa thuận đầu tư của ${data.investorName}?`,
      nzOkText: 'Chấp nhận',
      nzOkType: 'primary',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.dealOfferService.acceptDeal(data.id, this.projectId)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Chấp nhận thỏa thuận thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.notification.success("Thành công", "Chấp nhận thỏa thuận thành công!", { nzDuration: 2000 });
            data = { ...data!, dealStatus: DealStatus.ACCEPTED };
          });
      }
    });
  }

  rejectDeal(data: ProjectDealItem) {
    this.modalService.confirm({
      nzTitle: 'Từ chối thỏa thuận',
      nzContent: `Từ chối thỏa thuận đầu tư của ${data.investorName}?`,
      nzOkText: 'Từ chối',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        this.dealOfferService.rejectDeal(data.id, this.projectId)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Từ chối thỏa thuận thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.notification.success("Thành công", "Từ chối thỏa thuận thành công!", { nzDuration: 2000 });
            data = { ...data, dealStatus: DealStatus.REJECTED };
          });
      }
    });
  }

  navigateToDealDetails(deal: ProjectDealItem) {
    this.router.navigate(['projects',this.projectId,'deals',deal.id]);
  }

  navigateToCreateContract(deal: ProjectDealItem) {
    this.router.navigate(['projects', this.projectId, 'create-investment-contract', ], {
      queryParams: { dealId: deal.id }
    });
  }
}
