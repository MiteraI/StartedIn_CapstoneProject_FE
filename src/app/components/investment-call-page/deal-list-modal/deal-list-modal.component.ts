import { CommonModule } from '@angular/common'
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { Router } from '@angular/router'
import { NZ_MODAL_DATA, NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { catchError, throwError } from 'rxjs'
import { DealOfferService } from 'src/app/services/deal-offer.service'
import { InvestmentCallService } from 'src/app/services/investment-call.service'
import { DealStatusLabels } from 'src/app/shared/enums/deal-status.enum'
import { ProjectDealItem } from 'src/app/shared/models/deal-offer/project-deal-item.model'
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe'

@Component({
  selector: 'app-deal-list-modal',
  templateUrl: './deal-list-modal.component.html',
  styleUrls: ['./deal-list-modal.component.scss'],
  standalone: true,
  imports: [CommonModule,VndCurrencyPipe,MatIconModule,NzModalModule],
})
export class DealListModalComponent implements OnInit {
  @Input({ required: true }) projectId!: string
  readonly nzModalData = inject(NZ_MODAL_DATA)
  deals: ProjectDealItem[] | undefined
  readonly DealStatusLabels = DealStatusLabels
  @Output() refreshNeeded = new EventEmitter<void>()

  constructor(
    private investmentCallService: InvestmentCallService,
    private dealOfferService: DealOfferService,
    private modalService: NzModalService,
    private router: Router,
    private notification: NzNotificationService) {
    this.deals = this.nzModalData.dealOffers
  }

  ngOnInit() {
    console.log(this.deals)
  }
  
  acceptDeal(deal: ProjectDealItem) {
      this.modalService.confirm({
        nzTitle: 'Chấp nhận thỏa thuận',
        nzContent: `Chấp nhận thỏa thuận đầu tư của ${deal.investorName}?`,
        nzOkText: 'Chấp nhận',
        nzOkType: 'primary',
        nzCancelText: 'Hủy',
        nzOnOk: () => {
          this.dealOfferService.acceptDeal(deal.id, this.projectId)
            .pipe(
              catchError(error => {
                this.notification.error("Lỗi", error.error || "Chấp nhận thỏa thuận thất bại!", { nzDuration: 2000 });
                return throwError(() => new Error(error.error));
              })
            )
            .subscribe(() => {
              this.notification.success("Thành công", "Chấp nhận thỏa thuận thành công!", { nzDuration: 2000 });
              this.refreshNeeded.emit();
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
                this.notification.error("Lỗi", error.error || "Từ chối thỏa thuận thất bại!", { nzDuration: 2000 });
                return throwError(() => new Error(error.error));
              })
            )
            .subscribe(() => {
              this.notification.success("Thành công", "Từ chối thỏa thuận thành công!", { nzDuration: 2000 });
              this.refreshNeeded.emit();
            });
        }
      });
    }

    navigateToCreateContract(deal: ProjectDealItem) {
      this.router.navigate(['projects', this.projectId, 'create-investment-contract', ], {
        queryParams: { dealId: deal.id }
      });
    }
}
