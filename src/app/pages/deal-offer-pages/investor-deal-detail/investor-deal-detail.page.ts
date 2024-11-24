import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { DealStatus, DealStatusLabels } from 'src/app/shared/enums/deal-status.enum';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { InvestorDealItem } from 'src/app/shared/models/deal-offer/investor-deal-item.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-investor-deal-detail',
  templateUrl: './investor-deal-detail.page.html',
  styleUrls: ['./investor-deal-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NzModalModule, VndCurrencyPipe]
})
export class InvestorDealDetailPage implements OnInit {
  deal!: InvestorDealItem;
  dealStatuses = DealStatus;
  statusLabels = DealStatusLabels;

  constructor(
    private route: ActivatedRoute,
    private location: Location // Inject the Location service here
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.deal = data['deal'];
    });
  }

  goBack(): void {
    this.location.back(); // Navigate to the previous page
  }
}