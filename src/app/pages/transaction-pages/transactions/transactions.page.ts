import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from 'src/app/services/transaction.service';
import { TransactionModel } from 'src/app/shared/models/transaction/transaction.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Subject, takeUntil, catchError, throwError } from 'rxjs';
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service';
import { ScrollService } from 'src/app/core/util/scroll.service';
import { TransactionType, TransactionTypeLabels } from 'src/app/shared/enums/transaction-type.enum';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { TransactionTypeModalComponent } from 'src/app/components/transaction-pages/transaction-type-modal/transaction-type-modal.component';
import { DashboardService } from 'src/app/services/dashboard.service';
import { TransactionFilterComponent } from 'src/app/components/transaction-pages/transaction-filter-component/transaction-filter-component.component';

interface FilterOptions {
  fromName?: string;
  toName?: string;
  type?: TransactionType;
  dateFrom?: Date;
  dateTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  isInFlow?: boolean;
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    FilterBarComponent,
    MatIconModule,
    RouterModule,
    VndCurrencyPipe,
    NzPaginationModule,
    NzSpinModule,
    NzButtonModule,
    NzModalModule,
    TransactionFilterComponent
  ]
})
export class TransactionsPage implements OnInit, OnDestroy {
  projectId!: string;

  transactions: TransactionModel[] = [];

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRecords: number = 0;

  transactionTypes = TransactionType;
  typeLabels = TransactionTypeLabels;

  isLoading = false;
  isDesktopView = false;
  isLeader = false;

  currentBudget: number = 0;
  inAmount: number = 0;
  outAmount: number = 0;

  @ViewChild(TransactionFilterComponent) filterComponent!: TransactionFilterComponent;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private transactionService: TransactionService,
    private notification: NzNotificationService,
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService,
    private modal: NzModalService,
    private roleService: RoleInTeamService
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(map => {
      if (!map.get('id')) return;
      this.projectId = map.get('id')!;
      this.loadTransactionSummary();
      this.filterTransactions();
    });

    this.viewMode.isDesktopView$.subscribe(isDesktop => {
      this.isDesktopView = isDesktop;
    });

    this.scrollService.scroll$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMore();
      });

    this.roleService.role$.subscribe(role => {
      this.isLeader = role?.roleInTeam === TeamRole.LEADER;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filterTransactions(append: boolean = false) {
    this.isLoading = true;
    this.transactionService
      .getTransactionList(
        this.projectId,
        this.pageIndex,
        this.pageSize,
        this.filter.fromName,
        this.filter.toName,
        this.filter.type,
        this.filter.isInFlow,
        this.filter.dateFrom,
        this.filter.dateTo,
        this.filter.amountFrom,
        this.filter.amountTo
      )
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách giao dịch thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.transactions = append ? [...this.transactions, ...result.data] : result.data;
        this.totalRecords = result.total;
        this.isLoading = false;
      });
  }

  onFilterApplied(filterResult: any) {
    this.filter = {...filterResult};
    this.pageIndex = 1;
    this.filterTransactions();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      fromName: searchText
    };
    this.pageIndex = 1;
    this.filterTransactions();
  }

  processContent(content: string) : string {
    if (!content || !content.length) return 'Không có nội dung giao dịch';
    if (content.length <= 80) return content;
    return content.slice(0, 80) + '...';
  }

  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords;
  }

  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return;

    this.pageIndex++;
    this.filterTransactions(true);
  }

  onPageIndexChange(pageIndex: number) {
    this.pageIndex = pageIndex;
    this.filterTransactions();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.filterTransactions();
  }

  showTypeModal(): void {
    this.modal.create({
      nzTitle: 'Chọn loại giao dịch',
      nzContent: TransactionTypeModalComponent,
      nzFooter: null,
      nzData: this.projectId
    });
  }

  private loadTransactionSummary() {
    this.dashboardService
      .getDashboard(this.projectId)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy thông tin tổng quan thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(summary => {
        this.currentBudget = summary.currentBudget;
        this.inAmount = summary.inAmount;
        this.outAmount = summary.outAmount;
      });
  }
}
