import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { format } from 'date-fns';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { catchError, throwError } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { MatMenuModule } from '@angular/material/menu';
import { DealStatus, DealStatusLabels } from 'src/app/shared/enums/deal-status.enum';
import { InvestorDealItem } from 'src/app/shared/models/deal-offer/investor-deal-item.model';
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';
import { DealOfferService } from 'src/app/services/deal-offer.service';

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
    IonicModule,
    CommonModule,
    NzAvatarModule,
    NzModalModule,
    FilterBarComponent,
    MatMenuModule
  ]
})
export class InvestorDealListPage implements OnInit {
  searchResult: SearchResponseModel<InvestorDealItem> = {
    responseList: [],
    pageIndex: 1,
    pageSize: 10,
    totalPage: 0,
    totalRecord: 0
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
    private modalService: NzModalService,
    private dealOfferService: DealOfferService
  ) {
    addIcons({
      trashOutline
    });
  }

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
        this.dealOffers = result.responseList;
      });
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'HH:mm dd/MM/yyyy');
  }

  isSelected(offer: InvestorDealItem): boolean {
    return this.selectedOffers.some(o => o.id === offer.id);
  }

  toggleSelection(offer: InvestorDealItem) {
    const index = this.selectedOffers.findIndex(o => o.id === offer.id);
    if (index === -1) {
      this.selectedOffers.push(offer);
    } else {
      this.selectedOffers.splice(index, 1);
    }
  }

  isAllSelected(): boolean {
    return this.dealOffers.length > 0
      && this.dealOffers.every(offer => this.isSelected(offer));
  }

  toggleAllSelection() {
    if (this.isAllSelected()) {
      this.selectedOffers = [];
    } else {
      this.selectedOffers = [...this.dealOffers];
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

  get filterData() {
    return {
      ...this.filter,
      //id: this.route.parent?.snapshot.paramMap.get('id')!
    };
  }

  onFilterApplied(filterResult: any) {
    this.filter = {...filterResult};
    this.filterOffers();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }
}