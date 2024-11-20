import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { format, isToday, isYesterday } from 'date-fns';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DisbursementService } from 'src/app/services/disbursement.service';
import { DisbursementItemModel } from 'src/app/shared/models/disbursement/disbursement-item.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { DisbursementStatus, DisbursementStatusLabels } from 'src/app/shared/enums/disbursement-status.enum';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { DisbursementFilterComponent } from 'src/app/components/disbursement-pages/disbursement-filter/disbursement-filter.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, takeUntil } from 'rxjs';
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service';
import { ScrollService } from 'src/app/core/util/scroll.service';
import { RejectDisbursementFormComponent } from 'src/app/components/disbursement-pages/reject-disbursement-form/reject-disbursement-form.component';
import { DisburseModalComponent } from 'src/app/components/disbursement-pages/disburse-modal/disburse-modal.component';

interface FilterOptions {
  name?: string;
  periodFrom?: Date;
  periodTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  status?: DisbursementStatus;
  projectId?: string;
  contractId?: string;
}

@Component({
  selector: 'app-investor-disbursement-list',
  templateUrl: './investor-disbursement-list.page.html',
  styleUrls: ['./investor-disbursement-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    NzModalModule,
    FilterBarComponent,
    DisbursementFilterComponent,
    MatIconModule,
    RouterModule,
    VndCurrencyPipe,
    NzPaginationModule,
    NzSpinModule
  ]
})
export class InvestorDisbursementListPage implements OnInit, OnDestroy {
  disbursements: DisbursementItemModel[] = [];
  selectedDisbursements: DisbursementItemModel[] = [];
  keys: string[] = [];
  disbursementGroups: DisbursementItemModel[][] = [];

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRecords: number = 200;

  disbursementStatuses = DisbursementStatus;
  statusLabels = DisbursementStatusLabels;

  isLoading = false;
  isDesktopView = false;
  isInProject = false;
  private destroy$ = new Subject<void>();

  @ViewChild('filterComponent') filterComponent!: DisbursementFilterComponent;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private disbursementService: DisbursementService,
    private notification: NzNotificationService,
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService
  ) {}

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
      if (params['id']) {
        this.filter.projectId = params['id'];
        this.isInProject = true;
      }
      this.filterDisbursements();
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

  filterDisbursements(append: boolean = false) {
    this.isLoading = true;
    this.disbursementService
      .getDisbursements(
        this.pageIndex,
        this.pageSize,
        this.filter.name,
        this.filter.periodFrom,
        this.filter.periodTo,
        this.filter.amountFrom,
        this.filter.amountTo,
        this.filter.status,
        this.filter.projectId,
        this.filter.contractId
      )
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách giải ngân thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.disbursements = append ? [...this.disbursements, ...result.data] : result.data;
        this.totalRecords = result.total;
        this.groupDisbursements();
        this.isLoading = false;
      });
  }

  groupDisbursements() {
    var groupCount = 0;
    this.disbursementGroups = [];
    this.keys = [];
    this.disbursements.forEach((disbursement) => {
      const date = format(new Date(disbursement.startDate), 'yyyy-MM-dd');
      if (!this.keys.includes(date)) {
        this.keys.push(date);
        this.disbursementGroups.push([disbursement]);
        groupCount++;
      } else {
        this.disbursementGroups[this.keys.indexOf(date)].push(disbursement);
      }
    });
  }

  formatGroupHeader(dateStr: string): string {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'yyyy/MM/dd');
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy');
  }

  canDisburse(disbursement: DisbursementItemModel): boolean {
    return disbursement.disbursementStatus === DisbursementStatus.PENDING
      || disbursement.disbursementStatus === DisbursementStatus.OVERDUE;
  }

  openDisburseModal(disbursement: DisbursementItemModel) {
    this.modalService.create({
      nzTitle: 'Giải ngân',
      nzContent: DisburseModalComponent,
      nzData: disbursement,
      nzOnOk: (componentInstance) => {
        return componentInstance.handleConfirm();
      }
    });
  }

  openRejectModal(disbursement: DisbursementItemModel) {
    this.modalService.create({
      nzTitle: 'Từ chối giải ngân',
      nzContent: RejectDisbursementFormComponent,
      nzData: disbursement,
      nzOnOk: (componentInstance) => {
        const reason = componentInstance.rejectForm.get('reason')!.value;
        this.disbursementService
          .rejectDisbursement(disbursement.id, reason)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Từ chối giải ngân thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(response => disbursement.disbursementStatus = DisbursementStatus.REJECTED);
      }
    });
  }

  get filterData() {
    return {
      ...this.filter
    };
  }

  onFilterApplied(filterResult: any) {
    this.filter = {...filterResult};
    this.filterDisbursements();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      name: searchText
    };
    this.filterDisbursements();
  }

  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords;
  }

  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return;

    this.pageIndex++;
    this.filterDisbursements(true);
  }

  onPageIndexChange(pageIndex: number) {
    this.pageIndex = pageIndex;
    this.filterDisbursements();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.filterDisbursements();
  }
}
