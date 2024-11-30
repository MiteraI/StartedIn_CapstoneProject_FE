import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { catchError, Subject, takeUntil, throwError } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { DealStatus, DealStatusLabels } from 'src/app/shared/enums/deal-status.enum';
import { InvestorDealItem } from 'src/app/shared/models/deal-offer/investor-deal-item.model';
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service';
import { ScrollService } from 'src/app/core/util/scroll.service';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';


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
    MatIconModule,
    NzPaginationModule,
    NzSpinModule
  ]
})
export class InvestorDealListPage implements OnInit, OnDestroy {
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
  totalRecords: number = 200

  dealStatuses = DealStatus;
  statusLabels = DealStatusLabels;

  isLoading = false;
  isDesktopView = false;
  isLeader = false;

  @ViewChild('filterComponent') filterComponent: any;
  private destroy$ = new Subject<void>();

  constructor(
    private dealOfferService: DealOfferService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService,
    private roleService: RoleInTeamService,
    private modalService: NzModalService,
  ) {}

  ngOnInit() {
    this.filterOffers();
    this.viewMode.isDesktopView$.subscribe(isDesktop => {
      this.isDesktopView = isDesktop;
    });
    this.scrollService.scroll$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMore();
      });

  }

  filterOffers(append: boolean = false) {
    this.isLoading = true;
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
        this.totalRecords = result.total;
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
    this.pageIndex = 1;
    this.filterOffers();
  }

  onFilterApplied(filterResult: any) {
    this.filter = {...filterResult};
    this.pageIndex = 1;
    this.filterOffers();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }

  navigateToDealDetails(deal: InvestorDealItem) {
    this.router.navigate([deal.id], { relativeTo: this.route });
  }
  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords
  }

  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return;

    this.pageIndex++;
    this.filterOffers(true);
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.filterOffers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.filterOffers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
