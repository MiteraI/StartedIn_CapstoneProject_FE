import { CommonModule, DecimalPipe } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { InvestmentCallLabel } from 'src/app/shared/enums/investment-call-status.enum'
import { InvestmentCallResponseDto } from 'src/app/shared/models/investment-call/investment-call-response-dto.model'

@Component({
  selector: 'app-investment-call-list-item',
  templateUrl: './investment-call-list-item.component.html',
  styleUrls: ['./investment-call-list-item.component.scss'],
  standalone: true,
  imports: [NzProgressModule, CommonModule, NzToolTipModule],
  providers: [DecimalPipe],
})
export class InvestmentCallListItemComponent implements OnInit {
  @Input({ required: true })
  investmentCall!: InvestmentCallResponseDto
  investmentCallLabels = InvestmentCallLabel
  constructor(private decimalPipe: DecimalPipe) {}

  ngOnInit() {}

  getAmountDetail(): string {
    const amountRaised = this.decimalPipe.transform(this.investmentCall.amountRaised, '1.0-0')
    const targetCall = this.decimalPipe.transform(this.investmentCall.targetCall, '1.0-0')
    return 'Số vốn đã gọi: ' + amountRaised + '/' + targetCall
  }
}
