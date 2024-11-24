import { CommonModule } from '@angular/common'
import { Component, Input, input, OnInit } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { InvestmentCallService } from 'src/app/services/investment-call.service'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { InvestmentCallResponseDto } from 'src/app/shared/models/investment-call/investment-call-response-dto.model'
import { InvestmentCallLabel } from 'src/app/shared/enums/investment-call-status.enum'
import { InvestmentCallStatus } from 'src/app/shared/enums/investment-call-status.enum'


@Component({
  selector: 'app-investment-call-table',
  templateUrl: './investment-call-table.component.html',
  styleUrls: ['./investment-call-table.component.scss'],
  standalone: true,
  imports: [NzTableModule, NzDividerModule, NzButtonModule, NzModalModule, CommonModule, NzPopconfirmModule],
})
export class InvestmentCallTableComponent implements OnInit {
  @Input({ required: true }) projectId!: string
  @Input({ required: true }) listInvestmentCall: InvestmentCallResponseDto[] = []
  @Input({ required: true }) isFetchAllCallLoading: boolean = false

  constructor(private investmentCallService: InvestmentCallService) {}

  ngOnInit() {}

  getStatusLabel(status: InvestmentCallStatus): string {
    return InvestmentCallLabel[status]
  }
}
