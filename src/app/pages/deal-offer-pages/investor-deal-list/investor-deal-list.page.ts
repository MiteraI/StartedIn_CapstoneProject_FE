import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { catchError, throwError } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { DealStatus, DealStatusLabels } from 'src/app/shared/enums/deal-status.enum';
import { InvestorDealItem } from 'src/app/shared/models/deal-offer/investor-deal-item.model';
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

interface FilterOptions {
  projectName?: string;
  dealStatus?: DealStatus;
  minAmount?: number;
  maxAmount?: number;
  minEquity?: number;
  maxEquity?: number;
}

@Component({
  selector: 'app-investor-deal-list',
  templateUrl: './investor-deal-list.page.html',
  styleUrls: ['./investor-deal-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    NzModalModule,
    FilterBarComponent,
    VndCurrencyPipe,
    MatIconModule
  ]
})
export class InvestorDealListPage implements OnInit {
  searchResult: SearchResponseModel<InvestorDealItem> = {
    data: [],
    page: 1,
    size: 10,
    total: 0
  };

  dealOffers: InvestorDealItem[] = [];
  selectedOffers: InvestorDealItem[] = [];

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 10;

  dealStatuses = DealStatus;
  statusLabels = DealStatusLabels;

  @ViewChild('filterComponent') filterComponent: any;

  constructor(
    private dealOfferService: DealOfferService,
    private router: Router
  ) {}

  ngOnInit() {
    this.filterOffers();
  }

  filterOffers() {
    this.dealOfferService
      .getDealList(
        this.pageIndex,
        this.pageSize,
        this.filter.projectName,
        this.filter.dealStatus,
        this.filter.minAmount,
        this.filter.maxAmount,
        this.filter.minEquity,
        this.filter.maxEquity
      )
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.searchResult = result;
        this.dealOffers = result.data;
      });
  }

  isSelected(offer: InvestorDealItem): boolean {
    return this.selectedOffers.some(o => o.id === offer.id);
  }

  toggleSelection(offer: InvestorDealItem) {
    if (offer.dealStatus !== DealStatus.WAITING) return;

    const index = this.selectedOffers.findIndex(o => o.id === offer.id);
    if (index === -1) {
      this.selectedOffers.push(offer);
    } else {
      this.selectedOffers.splice(index, 1);
    }
  }

  isAllSelected(): boolean {
    const selectableOffers = this.dealOffers.filter(o => o.dealStatus === DealStatus.WAITING);
    return selectableOffers.length > 0 && selectableOffers.every(offer => this.isSelected(offer));
  }

  toggleAllSelection() {
    const selectableOffers = this.dealOffers.filter(o => o.dealStatus === DealStatus.WAITING);
    if (this.isAllSelected()) {
      this.selectedOffers = [];
    } else {
      this.selectedOffers = [...selectableOffers];
    }
  }

  deleteSelected() {
    // Implement delete functionality
    this.dealOffers = this.dealOffers.filter(
      offer => !this.selectedOffers.some(o => o.id === offer.id)
    );
    this.selectedOffers = [];
  }

  deleteOffer(offer: InvestorDealItem) {
    // Delete single offer (mobile view)
    this.dealOffers = this.dealOffers.filter(o => o.id !== offer.id);
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      projectName: searchText
    };
    this.filterOffers();
  }

  onFilterApplied(filterResult: any) {
    this.filter = {...filterResult};
    this.filterOffers();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }

  navigateToDealDetails(deal: InvestorDealItem) {
    this.router.navigate([deal.id]);
  }
}
