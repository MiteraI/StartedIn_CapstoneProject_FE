import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { format, isToday, isYesterday } from 'date-fns';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ContractService } from 'src/app/services/contract.service';
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';
import { ContractListItemModel } from 'src/app/shared/models/contract/contract-list-item.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ContractStatus, ContractStatusLabels } from 'src/app/shared/enums/contract-status.enum';
import { ContractType, ContractTypeLabels } from 'src/app/shared/enums/contract-type.enum';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { NewContractModalComponent } from 'src/app/components/contract-pages/new-contract-modal/new-contract-modal.component';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { ContractFilterComponent } from 'src/app/components/contract-pages/contract-filter/contract-filter.component';
import { MatIconModule } from '@angular/material/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

interface FilterOptions {
  contractName?: string;
  contractType?: ContractType;
  parties?: string[];
  lastUpdatedStartDate?: Date;
  lastUpdatedEndDate?: Date;
  contractStatus?: ContractStatus;
}

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.page.html',
  styleUrls: ['./contract-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    NzModalModule,
    InitialsOnlyPipe,
    FilterBarComponent,
    ContractFilterComponent,
    MatIconModule,
    RouterModule,
    NzPaginationModule,
    NzSpinModule
  ]
})
export class ContractListPage implements OnInit {
  projectId!: string;
  searchResult: SearchResponseModel<ContractListItemModel> = {
    data: [],
    page: 1,
    size: 20,
    total: 0
  };

  contracts: ContractListItemModel[] = [];
  selectedContracts: ContractListItemModel[] = [];
  keys: string[] = [];
  contractGroups: ContractListItemModel[][] = [];

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 2;

  contractTypes = ContractType;
  contractStatuses = ContractStatus;
  typeLabels = ContractTypeLabels;
  statusLabels = ContractStatusLabels;

  isLoading = false;
  isDesktopView = false;

  @ViewChild(ContractFilterComponent) filterComponent!: ContractFilterComponent;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private contractService: ContractService,
    private notification: NzNotificationService,
    private viewMode: ViewModeConfigService
  ) {
    this.viewMode.isDesktopView$.subscribe(isDesktop => {
      this.isDesktopView = isDesktop;
    });
  }

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(map => {
      if (!map.get('id')) {
        return;
      }
      this.projectId = map.get('id')!;
      this.filterContracts();
    })
  }

  // filter stuff
  filterContracts() {
    this.contractService
      .getContractListForProject(
        this.projectId,
        this.pageIndex,
        this.pageSize,
        this.filter.contractName,
        this.filter.contractType,
        this.filter.parties,
        this.filter.lastUpdatedStartDate,
        this.filter.lastUpdatedEndDate,
        this.filter.contractStatus
      )
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách hợp đồng thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.searchResult = result;
        this.contracts = result.data;
        this.groupContracts();
      });
  }

  get filterData() {
    return {
      ...this.filter,
      id: this.projectId
    };
  }

  onFilterApplied(filterResult: any) {
    this.filter = {...filterResult};
    this.filterContracts();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      contractName: searchText
    };
    this.filterContracts();
  }

  // render stuff
  groupContracts() {
    var groupCount = 0;
    this.contractGroups = [];
    this.keys = [];
    this.contracts.forEach((contract) => {
      const date = format(new Date(contract.lastUpdatedTime), 'yyyy-MM-dd');
      if (!this.keys.includes(date)) {
        this.keys.push(date);
        this.contractGroups.push([contract]);
        groupCount++;
      } else {
        this.contractGroups[this.keys.indexOf(date)].push(contract);
      }
    })
  }

  formatGroupHeader(dateStr: string): string {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'yyyy/MM/dd');
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'HH:mm dd/MM/yyyy');
  }

  isSelected(contract: ContractListItemModel): boolean {
    return this.selectedContracts.some(c => c.id === contract.id);
  }

  toggleSelection(contract: ContractListItemModel) {
    const index = this.selectedContracts.findIndex(c => c.id === contract.id);
    if (index === -1) {
      this.selectedContracts.push(contract);
    } else {
      this.selectedContracts.splice(index, 1);
    }
  }

  isAllSelected(): boolean {
    return this.contracts.length > 0
      && this.contracts.every(contract => this.isSelected(contract));
  }

  toggleAllSelection() {
    if (this.isAllSelected()) {
      this.selectedContracts = [];
    } else {
      this.selectedContracts = [...this.contracts];
    }
  }

  // send stuff
  get canSendSelected() {
    return this.selectedContracts.every(c => c.contractStatus === ContractStatus.DRAFT);
  }

  sendSelected() {
    this.selectedContracts.forEach(c => this.sendContract(c));
  }

  sendContract(contract: ContractListItemModel) {
    this.contractService
      .sendContract(contract.id, this.projectId)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Gửi thỏa thuận thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => contract.contractStatus = this.contractStatuses.SENT);
  }

  // delete stuff
  get canDeleteSelected() {
    return this.selectedContracts.every(c => c.contractStatus === ContractStatus.DRAFT);
  }

  deleteSelected() {
    this.selectedContracts.forEach(c => this.deleteContract(c));
    this.groupContracts();
  }

  deleteSingle(contract: ContractListItemModel) {
    this.deleteContract(contract);
    this.groupContracts();
  }

  deleteContract(contract: ContractListItemModel) {
    // TODO call be
    this.contracts = this.contracts.filter(c => c.id !== contract.id);
  }

  // add stuff
  openAddModal() {
    this.modalService.create({
      nzTitle: 'New Contract',
      nzContent: NewContractModalComponent,
      nzFooter: null,
      nzData: this.projectId
    });
  }

  // download stuff
  get canDownloadSelected() {
    return this.selectedContracts.every(c => c.contractStatus !== ContractStatus.DRAFT);
  }

  downloadSelected() {
    this.selectedContracts.forEach(c => this.download(c));
  }

  download(contract: ContractListItemModel) {
    this.contractService
      .downloadContract(contract.id, this.projectId)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Tải hợp đồng thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(response => {
        window.open(response.downLoadUrl, '_blank');
      });
  }

  // Add scroll handler for mobile infinite scroll
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.isDesktopView || this.isLoading) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (windowHeight + scrollTop >= documentHeight - 100) {
      this.loadMore();
    }
  }

  loadMore(): void {
    if (this.searchResult.page * this.searchResult.size >= this.searchResult.total) return;

    this.isLoading = true;
    this.pageIndex++;

    this.contractService
      .getContractListForProject(
        this.projectId,
        this.pageIndex,
        this.pageSize,
        this.filter.contractName,
        this.filter.contractType,
        this.filter.parties,
        this.filter.lastUpdatedStartDate,
        this.filter.lastUpdatedEndDate,
        this.filter.contractStatus
      )
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách hợp đồng thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.searchResult.data = [...this.searchResult.data, ...result.data];
        this.contracts = [...this.contracts, ...result.data];
        this.groupContracts();
        this.isLoading = false;
      });
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.filterContracts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.filterContracts();
  }
}
