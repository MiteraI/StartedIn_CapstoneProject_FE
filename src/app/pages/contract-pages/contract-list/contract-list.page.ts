import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, OnDestroy, EventEmitter } from '@angular/core';
import { format, isToday, isYesterday } from 'date-fns';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ContractService } from 'src/app/services/contract.service';
import { ContractListItemModel } from 'src/app/shared/models/contract/contract-list-item.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, throwError, Subject, takeUntil } from 'rxjs';
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
import { ScrollService } from 'src/app/core/util/scroll.service';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { ContractTableComponent } from "../../../components/contract-pages/contract-table/contract-table.component";
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';
import { TerminateContractModalComponent } from 'src/app/components/contract-pages/terminate-contract-modal/terminate-contract-modal.component';
import { LiquidationModalComponent } from 'src/app/components/contract-pages/liquidation-modal/liquidation-modal.component';
import { TerminateMeetingModalComponent } from 'src/app/components/contract-pages/terminate-meeting-modal/terminate-meeting-modal.component';

interface FilterOptions {
  contractIdNumber?: string;
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
    NzSpinModule,
    ContractTableComponent
]
})
export class ContractListPage implements OnInit, OnDestroy {
  projectId!: string;

  contracts: ContractListItemModel[] = [];
  selectedContracts: ContractListItemModel[] = [];
  keys: string[] = [];
  contractGroups: ContractListItemModel[][] = [];

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRecords: number = 200;

  contractTypes = ContractType;
  contractStatuses = ContractStatus;
  typeLabels = ContractTypeLabels;
  statusLabels = ContractStatusLabels;

  isLoading = true;
  isDesktopView = false;
  isLeader = false;

  @ViewChild(ContractFilterComponent) filterComponent!: ContractFilterComponent;
  private destroy$ = new Subject<void>();

  listContract: SearchResponseModel<ContractListItemModel> = {
    data: [],
    page: 1,
    size: 10,
    total: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private contractService: ContractService,
    private notification: NzNotificationService,
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService,
    private roleService: RoleInTeamService
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(map => {
      if (!map.get('id')) {
        return;
      }
      this.projectId = map.get('id')!;
      this.roleService.role$.subscribe(role => {
        this.isLeader = role === TeamRole.LEADER;
        this.filterContracts();
      });
    });
    this.viewMode.isDesktopView$.subscribe(isDesktop => {
      this.isDesktopView = isDesktop;
    });
    this.scrollService.scroll$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadMore());
  }

  // filter stuff
  filterContracts(append: boolean = false) {
    this.isLoading = true;
    this.contractService
      .getContractListForProject(
        this.projectId,
        this.pageIndex,
        this.pageSize,
        this.filter.contractIdNumber,
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
        // Update listContract with the new data
        this.listContract = {
          data: append ? [...this.listContract.data, ...result.data] : result.data,
          page: this.pageIndex,
          size: this.pageSize,
          total: result.total
        };

        // Update contracts from listContract data
        this.contracts = this.listContract.data.filter(c =>
          this.isLeader || c.contractStatus !== ContractStatus.DRAFT
        );

        this.totalRecords = this.listContract.total;
        this.groupContracts();
        this.isLoading = false;
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
    this.pageIndex = 1;
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
    this.pageIndex = 1;
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
    if (isToday(date)) return 'Hôm nay';
    if (isYesterday(date)) return 'Hôm qua';
    return format(date, 'dd/MM/yyyy');
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
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
      .subscribe(result => {
        contract.contractStatus = this.contractStatuses.SENT;
        contract.lastUpdatedTime = new Date().toISOString();
        this.groupContracts();
        this.notification.success("Thành công", "Gửi hợp đồng thành công!", { nzDuration: 2000 });
      });
  }

  // delete stuff
  deleteContract(contract: ContractListItemModel) {
    this.contractService
      .deleteContract(contract.id, this.projectId)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Không thể xóa hợp đồng!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(() => {
        this.contracts = this.contracts.filter(c => c.id !== contract.id);
        this.groupContracts();
        this.notification.success("Thành công", "Xóa hợp đồng thành công!", { nzDuration: 2000 });
      });
  }

  // expire stuff
  expireContract(contract: ContractListItemModel) {
    this.contractService
      .expireContract(contract.id, this.projectId)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Không thể kết thúc hợp đồng!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(() => {
        contract.contractStatus = this.contractStatuses.EXPIRED;
        contract.lastUpdatedTime = new Date().toISOString();
        this.groupContracts();
        this.notification.success("Thành công", "Kết thúc hợp đồng thành công!", { nzDuration: 2000 });
      });
  }

  // terminate stuff
  openTerminateModal(contract: ContractListItemModel) {
    if (this.isLeader) {
      this.modalService.create({
        nzTitle: 'Kết thúc hợp đồng',
        nzContent: TerminateMeetingModalComponent,
        nzData: { projectId: this.projectId, contractId: contract.id, isFromLeader: true },
        nzFooter: null,
        nzStyle: { top: '40px' },
      }).afterClose.subscribe(result => {
        if (result) this.filterContracts();
      });
    } else {
      this.modalService.create({
        nzTitle: 'Kết thúc hợp đồng',
        nzContent: TerminateContractModalComponent,
        nzData: {projectId: this.projectId, contractId: contract.id },
        nzFooter: null,
      }).afterClose.subscribe(result => {
        if (result) this.filterContracts();
      });
    }
  }

  // liquidation stuff
  openLiquidationModal(contract: ContractListItemModel) {
    if (contract.liquidationNoteId) {
      this.router.navigate([
        '/projects',
        this.projectId,
        'liquidation-contract',
        contract.liquidationNoteId
      ]);
    }
    const modalRef = this.modalService.create({
      nzTitle: 'Thanh lý hợp đồng',
      nzContent: LiquidationModalComponent,
      nzData: { projectId: this.projectId, contractId: contract.id },
      nzFooter: null,
    }).afterClose.subscribe(result => {
      if (result) this.filterContracts();
    });
  }

  // add stuff
  openAddModal() {
    this.modalService.create({
      nzTitle: 'Tạo hợp đồng mới',
      nzContent: NewContractModalComponent,
      nzFooter: null,
      nzData: this.projectId
    });
  }

  // download stuff
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

  // cancel stuff
  cancelSign(contract: ContractListItemModel) {
    this.modalService.confirm({
      nzTitle: 'Từ chối ký hợp đồng',
      nzContent: `Từ chối ký ${contract.contractName}?`,
      nzOkText: 'Từ chối',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        this.contractService.cancelSign(this.projectId, contract.id)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Từ chối ký hợp đồng thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.notification.success("Thành công", "Từ chối ký hợp đồng thành công!", { nzDuration: 2000 });
            contract = { ...contract, contractStatus: ContractStatus.DECLINED };
          });
      }
    });
  }

  // infinite scroll stuff
  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords
  }

  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return;

    this.pageIndex++;
    this.filterContracts(true);
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

  // navigation stuff
  navigateToContract(contract: ContractListItemModel) {
    this.router.navigate([
      '/projects',
      this.projectId,
      contract.contractType === ContractType.INVESTMENT ? 'investment-contract' :
      contract.contractType === ContractType.INTERNAL ? 'internal-contract' :
      contract.contractType === ContractType.LIQUIDATIONNOTE ? 'liquidation-contract' : '',
      contract.id
    ])
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
