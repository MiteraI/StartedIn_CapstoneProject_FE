import { CommonModule, DecimalPipe } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzModalService } from 'ng-zorro-antd/modal'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { InvestmentCallLabel } from 'src/app/shared/enums/investment-call-status.enum'
import { InvestmentCallResponseDto } from 'src/app/shared/models/investment-call/investment-call-response-dto.model'
import { DealListModalComponent } from '../../deal-list-modal/deal-list-modal.component'

@Component({
  selector: 'app-investment-call-list-item',
  templateUrl: './investment-call-list-item.component.html',
  styleUrls: ['./investment-call-list-item.component.scss'],
  standalone: true,
  imports: [NzProgressModule, CommonModule, NzToolTipModule, NzIconModule],
  providers: [DecimalPipe],
})
export class InvestmentCallListItemComponent implements OnInit {
  @Input({ required: true })
  investmentCall!: InvestmentCallResponseDto
  investmentCallLabels = InvestmentCallLabel
  constructor(private decimalPipe: DecimalPipe, private modalService: NzModalService) {}

  ngOnInit() {}

  getAmountDetail(): string {
    const amountRaised = this.decimalPipe.transform(this.investmentCall.amountRaised, '1.0-0')
    const targetCall = this.decimalPipe.transform(this.investmentCall.targetCall, '1.0-0')
    return 'Số vốn đã gọi: ' + amountRaised + '/' + targetCall
  }

  openDealListModal(): void {
    const modalRef = this.modalService.create({
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzContent: DealListModalComponent,
      nzTitle: 'Danh sách nhà đầu tư',
      nzData: {
        dealOffers: this.investmentCall.dealOffers,
      },
      nzFooter: null,
      nzWidth: '80%',
    })
  }
}
