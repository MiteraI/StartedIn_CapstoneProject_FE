import { Component, Input, OnInit } from '@angular/core'
import { InvestmentCallResponseDto } from 'src/app/shared/models/investment-call/investment-call-response-dto.model'

@Component({
  selector: 'app-investment-call-list-item',
  templateUrl: './investment-call-list-item.component.html',
  styleUrls: ['./investment-call-list-item.component.scss'],
  standalone: true,
})
export class InvestmentCallListItemComponent implements OnInit {
  @Input({ required: true })
  investmentCall!: InvestmentCallResponseDto
  constructor() {}

  ngOnInit() {}
}
