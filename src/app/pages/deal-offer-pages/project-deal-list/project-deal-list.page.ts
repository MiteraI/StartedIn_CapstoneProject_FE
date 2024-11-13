import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { catchError, throwError } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { DealStatus, DealStatusLabels } from 'src/app/shared/enums/deal-status.enum';
import { ProjectDealItem } from 'src/app/shared/models/deal-offer/project-deal-item.model';
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';

interface FilterOptions {
  investorName?: string;
  dealStatus?: DealStatus;
  minAmount?: number;
  maxAmount?: number;
  minEquity?: number;
  maxEquity?: number;
}

@Component({
  selector: 'app-project-deal-list',
  templateUrl: './project-deal-list.page.html',
  styleUrls: ['./project-deal-list.page.scss'],
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
export class ProjectDealListPage implements OnInit {
  projectId!: string;

  searchResult: SearchResponseModel<ProjectDealItem> = {
    responseList: [],
    pageIndex: 1,
    pageSize: 10,
    totalPage: 0,
    totalRecord: 0
  };

  deals: ProjectDealItem[] = [];
  selectedDeals: ProjectDealItem[] = [];

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 10;

  dealStatuses = DealStatus;
  statusLabels = DealStatusLabels;

  @ViewChild('filterComponent') filterComponent: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private dealOfferService: DealOfferService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(map => {
      if (!map.get('id')) {
        return;
      }
      this.projectId = map.get('id')!
      this.filterDeals();
    });
  }

  filterDeals() {
    this.dealOfferService
      .getProjectDealList(
        this.projectId,
        this.pageIndex,
        this.pageSize,
        this.filter.investorName,
        this.filter.dealStatus,
        this.filter.minAmount,
        this.filter.maxAmount,
        this.filter.minEquity,
        this.filter.maxEquity
      )
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách thỏa thuận thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.searchResult = result;
        this.deals = result.responseList;
      });
  }

  isSelected(deal: ProjectDealItem): boolean {
    return this.selectedDeals.some(d => d.id === deal.id);
  }

  toggleSelection(deal: ProjectDealItem) {
    if (deal.dealStatus !== DealStatus.WAITING) return;

    const index = this.selectedDeals.findIndex(d => d.id === deal.id);
    if (index === -1) {
      this.selectedDeals.push(deal);
    } else {
      this.selectedDeals.splice(index, 1);
    }
  }

  isAllSelected(): boolean {
    const selectableDeals = this.deals.filter(d => d.dealStatus === DealStatus.WAITING);
    return selectableDeals.length > 0 && selectableDeals.every(deal => this.isSelected(deal));
  }

  toggleAllSelection() {
    const selectableDeals = this.deals.filter(d => d.dealStatus === DealStatus.WAITING);
    if (this.isAllSelected()) {
      this.selectedDeals = [];
    } else {
      this.selectedDeals = [...selectableDeals];
    }
  }

  acceptSelected() {
    this.modalService.confirm({
      nzTitle: 'Accept Selected Deals',
      nzContent: `Are you sure you want to accept ${this.selectedDeals.length} deals?`,
      nzOkText: 'Accept',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.selectedDeals.forEach(deal => {
          this.acceptDeal(deal, false);
        });
        this.selectedDeals = [];
      }
    });
  }

  rejectSelected() {
    this.modalService.confirm({
      nzTitle: 'Reject Selected Deals',
      nzContent: `Are you sure you want to reject ${this.selectedDeals.length} deals?`,
      nzOkText: 'Reject',
      nzOkDanger: true,
      nzOnOk: () => {
        this.selectedDeals.forEach(deal => {
          this.rejectDeal(deal, false);
        });
        this.selectedDeals = [];
      }
    });
  }

  acceptDeal(deal: ProjectDealItem, showConfirm: boolean = true) {
    const accept = () => {
      this.dealOfferService.acceptDeal(deal.id, this.projectId).subscribe(() => {
        const index = this.deals.findIndex(d => d.id === deal.id);
        if (index !== -1) {
          this.deals[index] = { ...deal, dealStatus: DealStatus.ACCEPTED };
        }
      });
    };

    if (showConfirm) {
      this.modalService.confirm({
        nzTitle: 'Accept Deal',
        nzContent: `Are you sure you want to accept this deal from ${deal.investorName}?`,
        nzOkText: 'Accept',
        nzOkType: 'primary',
        nzOnOk: accept
      });
    } else {
      accept();
    }
  }

  rejectDeal(deal: ProjectDealItem, showConfirm: boolean = true) {
    const reject = () => {
      this.dealOfferService.rejectDeal(deal.id, this.projectId).subscribe(() => {
        const index = this.deals.findIndex(d => d.id === deal.id);
        if (index !== -1) {
          this.deals[index] = { ...deal, dealStatus: DealStatus.REJECTED };
        }
      });
    };

    if (showConfirm) {
      this.modalService.confirm({
        nzTitle: 'Reject Deal',
        nzContent: `Are you sure you want to reject this deal from ${deal.investorName}?`,
        nzOkText: 'Reject',
        nzOkDanger: true,
        nzOnOk: reject
      });
    } else {
      reject();
    }
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      investorName: searchText
    };
    this.filterDeals();
  }

  get filterData() {
    return {
      ...this.filter,
      id: this.route.parent?.snapshot.paramMap.get('id')
    };
  }

  onFilterApplied(filterResult: any) {
    this.filter = {...filterResult};
    this.filterDeals();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }

  navigateToCreateContract(deal: ProjectDealItem) {
    this.router.navigate(['projects', this.projectId, 'create-investment-contract', ], {
      queryParams: {
        dealId: deal.id
      }
    });
  }

  navigateToDealDetails(deal: ProjectDealItem) {
    this.router.navigate([deal.id]);
  }
}
