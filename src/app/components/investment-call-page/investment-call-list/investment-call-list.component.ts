import { Component, Input } from '@angular/core'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { InvestmentCallResponseDto } from 'src/app/shared/models/investment-call/investment-call-response-dto.model'
import { InvestmentCallListItemComponent } from './investment-call-list-item/investment-call-list-item.component'
import { SearchResponseModel } from 'src/app/shared/models/search-response.model'

@Component({
  selector: 'app-investment-call-list',
  templateUrl: './investment-call-list.component.html',
  styleUrls: ['./investment-call-list.component.scss'],
  standalone: true,
  imports: [NzSpinModule, InvestmentCallListItemComponent],
})
export class InvestmentCallListComponent {
  @Input({ required: true }) investmentCallList: SearchResponseModel<InvestmentCallResponseDto> = {
      data: [],
      page: 1,
      size: 10,
      total: 0
  }
  @Input({ required: true }) projectId: string = ''
  constructor() {}
}
