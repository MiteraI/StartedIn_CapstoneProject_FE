import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject, takeUntil, catchError, throwError } from 'rxjs';
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service';
import { ScrollService } from 'src/app/core/util/scroll.service';
import { TransactionType, TransactionTypeLabels } from 'src/app/shared/enums/transaction-type.enum';

interface FilterOptions {
  name?: string;
  type?: TransactionType;
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
    NzSpinModule
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
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private notification: NzNotificationService,
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(map => {
      if (!map.get('id')) return;
      this.projectId = map.get('id')!;
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
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filterTransactions(append: boolean = false) {
    this.isLoading = true;
    this.transactionService
      .getTransactionList(this.projectId, this.pageIndex, this.pageSize)
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

  processContent(content: string) : string {
    if (!content || !content.length) return '';
    if (content.length <= 80) return content;
    return content.slice(0, 80) + '...';
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      name: searchText
    };
    this.filterTransactions();
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
}
