import { CommonModule } from '@angular/common'
import { Component, Input, input, OnInit } from '@angular/core'
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
import { ActivatedRoute, Router } from '@angular/router'
@Component({
  selector: 'app-investment-call-table',
  templateUrl: './investment-call-table.component.html',
  styleUrls: ['./investment-call-table.component.scss'],
  standalone: true,
  imports: [NzTableModule, 
    NzDividerModule, 
    MatIconModule, 
    NzButtonModule, 
    NzModalModule, 
    CommonModule, 
    NzPopconfirmModule],
})
export class InvestmentCallTableComponent implements OnInit {
  @Input({ required: true }) projectId!: string
  @Input({ required: true }) listInvestmentCall: InvestmentCallResponseDto[] = []
  @Input({ required: true }) isFetchAllCallLoading: boolean = false

  constructor(
    private investmentCallService: InvestmentCallService,
    private dealOfferService: DealOfferService,
    private modalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit() {}

  getStatusLabel(status: InvestmentCallStatus): string {
    return InvestmentCallLabel[status]
  }

  getDealStatusLabel(status: DealStatus): string {
    return DealStatusLabels[status]
  }
  
  acceptDeal(data: ProjectDealItem, showConfirm: boolean = true) {
    const accept = () => {
      this.dealOfferService.acceptDeal(data.id, this.projectId).subscribe(() => {
        this.investmentCallService.refreshInvestmentCall$.next(true)
      });
    };

    if (showConfirm) {
      this.modalService.confirm({
        nzTitle: 'Accept Deal',
        nzContent: `Are you sure you want to accept this deal from ${data.investorName}?`,
        nzOkText: 'Accept',
        nzOkType: 'primary',
        nzOnOk: accept
      });
    } else {
      accept();
    }
  }

  rejectDeal(data: ProjectDealItem, showConfirm: boolean = true) {
    const reject = () => {
      this.dealOfferService.rejectDeal(data.id, this.projectId).subscribe(() => {
        this.investmentCallService.refreshInvestmentCall$.next(true)
      });
    };

    if (showConfirm) {
      this.modalService.confirm({
        nzTitle: 'Reject Deal',
        nzContent: `Are you sure you want to reject this deal from ${data.investorName}?`,
        nzOkText: 'Reject',
        nzOkDanger: true,
        nzOnOk: reject
      });
    } else {
      reject();
    }
  }

   navigateToDealDetails(deal: ProjectDealItem) {
     this.router.navigate(['projects',this.projectId,'deals',deal.id]);
     console.log(deal);
   }

  navigateToCreateContract(deal: ProjectDealItem) {
    this.router.navigate(['projects', this.projectId, 'create-investment-contract', ], {
      queryParams: {
        dealId: deal.id
      }
    });
  }
}
