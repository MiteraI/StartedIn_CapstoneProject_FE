import { Component, Input, OnInit } from '@angular/core'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { InvestmentCallResponseDto } from 'src/app/shared/models/investment-call/investment-call-response-dto.model'
import { InvestmentCallListItemComponent } from './investment-call-list-item/investment-call-list-item.component'

@Component({
  selector: 'app-investment-call-list',
  templateUrl: './investment-call-list.component.html',
  styleUrls: ['./investment-call-list.component.scss'],
  standalone: true,
  imports: [NzSpinModule, InvestmentCallListItemComponent],
})
export class InvestmentCallListComponent implements OnInit {
  @Input({ required: true }) investmentCallList: InvestmentCallResponseDto[] = []
  @Input({ required: true }) projectId: string = ''
  @Input({ required: true }) isFetchAllCallLoading: boolean = false
  constructor() {}

  ngOnInit() {}
}
