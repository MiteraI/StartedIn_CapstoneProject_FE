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
import { RejectDisbursementFormComponent } from 'src/app/components/disbursement-pages/reject-disbursement-form/reject-disbursement-form.component';
import { DisbursementFilterComponent } from 'src/app/components/disbursement-pages/disbursement-filter/disbursement-filter.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, takeUntil } from 'rxjs';
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service';
import { ScrollService } from 'src/app/core/util/scroll.service';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';

interface FilterOptions {
  name?: string;
  periodFrom?: Date;
  periodTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  status?: DisbursementStatus;
  investorId?: string;
  contractId?: string;
}

@Component({
  selector: 'app-project-disbursement-list',
  templateUrl: './project-disbursement-list.page.html',
  styleUrls: ['./project-disbursement-list.page.scss'],
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
    NzSpinModule,
    InitialsOnlyPipe
  ]
})
export class ProjectDisbursementListPage implements OnInit, OnDestroy {
  projectId!: string;

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
    this.route.parent?.paramMap.subscribe(map => {
      if (!map.get('id')) {
        return;
      }
      this.projectId = map.get('id')!;
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
      .getDisbursementsForProject(
        this.projectId,
        this.pageIndex,
        this.pageSize,
        this.filter.name,
        this.filter.periodFrom,
        this.filter.periodTo,
        this.filter.amountFrom,
        this.filter.amountTo,
        this.filter.status,
        this.filter.investorId,
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

  openRejectModal(disbursement: DisbursementItemModel) {
    this.modalService.create({
      nzTitle: 'Từ chối giải ngân',
      nzContent: RejectDisbursementFormComponent,
      nzData: disbursement,
      nzOnOk: (componentInstance) => {
        const reason = componentInstance.rejectForm.get('reason')!.value;
        this.rejectDisbursement(disbursement, reason);
      }
    });
  }

  rejectDisbursement(disbursement: DisbursementItemModel, reason: string) {
    // TODO: Implement reject disbursement API call
    console.log('Rejecting disbursement:', disbursement.id, 'Reason:', reason);
  }

  confirmDisbursement(disbursement: DisbursementItemModel) {
    this.modalService.confirm({
      nzTitle: 'Xác nhận đã giải ngân',
      nzContent: `Xác nhận ${disbursement.investorName} đã giải ngân cho ${disbursement.title}?`,
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOnOk: () => {
        // TODO: Implement confirm API call
        console.log('Disbursing funds:', disbursement.id);
      }
    });
  }

  get filterData() {
    return {
      ...this.filter,
      projectId: this.projectId
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
