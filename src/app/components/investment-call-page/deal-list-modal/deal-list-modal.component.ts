import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { DealStatusLabels } from 'src/app/shared/enums/deal-status.enum'
import { ProjectDealItem } from 'src/app/shared/models/deal-offer/project-deal-item.model'

@Component({
  selector: 'app-deal-list-modal',
  templateUrl: './deal-list-modal.component.html',
  styleUrls: ['./deal-list-modal.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class DealListModalComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA)
  deals: ProjectDealItem[] | undefined
  readonly DealStatusLabels = DealStatusLabels

  constructor() {
    this.deals = this.nzModalData.dealOffers
  }

  ngOnInit() {
    console.log(this.deals)
  }
}
