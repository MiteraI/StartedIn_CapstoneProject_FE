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
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { Chart } from 'chart.js/auto';
import { DisbursementMonthlyInfoModel } from 'src/app/shared/models/disbursement/disbursement-monthly-info.model';

interface FilterOptions {
  name?: string;
  periodFrom?: Date;
  periodTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  status?: DisbursementStatus;
  investorId?: string;
  contractIdNumber?: string;
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

  monthlyInfo: DisbursementMonthlyInfoModel[] = [];
  private monthlyCharts: Chart[] = [];

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

    this.loadMonthlyInfo();
  }

  ngOnDestroy() {
    this.monthlyCharts.forEach(chart => chart.destroy());
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
        this.filter.contractIdNumber
      )
      .pipe(
        catchError(error => {
          if (error.error !== 'Người dùng không thuộc dự án.')
            this.notification.error("Lỗi", error.error || "Lấy danh sách giải ngân thất bại!", { nzDuration: 2000 });
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
    if (isToday(date)) return 'Hôm nay';
    if (isYesterday(date)) return 'Hôm qua';
    return format(date, 'dd/MM/yyyy');
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy');
  }

  confirmDisbursement(disbursement: DisbursementItemModel) {
    this.modalService.confirm({
      nzTitle: 'Xác nhận đã giải ngân',
      nzContent: `Xác nhận ${disbursement.investorName} đã giải ngân cho ${disbursement.title}?`,
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.disbursementService
          .confirmDisbursement(disbursement.id, this.projectId)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", error.error || "Xác nhận giải ngân thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(response => disbursement.disbursementStatus = DisbursementStatus.FINISHED);
      }
    });
  }

  rejectEvidence(disbursement: DisbursementItemModel) {
    this.modalService.confirm({
      nzTitle: 'Từ chối giải ngân',
      nzContent: `Từ chối ${disbursement.investorName} đã giải ngân cho ${disbursement.title}?`,
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.disbursementService
          .rejectEvidence(disbursement.id, this.projectId)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", error.error || "Từ chối giải ngân thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(response => disbursement.disbursementStatus = DisbursementStatus.NOTVALID);
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
    this.pageIndex = 1;
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
    this.pageIndex = 1;
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

  private loadMonthlyInfo(): void {
    this.disbursementService.getDisbursementMonthlyInfo(this.projectId)
      .subscribe(info => {
        this.monthlyInfo = info;
        setTimeout(() => {
          this.createMonthlyCharts();
        });
      });
  }

  private createMonthlyCharts(): void {
    // Clean up existing charts
    this.monthlyCharts.forEach(chart => chart.destroy());
    this.monthlyCharts = [];

    this.monthlyInfo.forEach((info, index) => {
      const canvas = document.getElementById(`monthlyChart${index}`) as HTMLCanvasElement;
      if (!canvas) return;

      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: [''],
          datasets: [
            {
              label: 'Đã giải ngân',
              data: [info.disbursedAmount / 1000],
              backgroundColor: '#10B981',
              borderRadius: 4
            },
            {
              label: 'Chưa giải ngân',
              data: [info.remainingDisbursement / 1000],
              backgroundColor: '#4F46E5',
              borderRadius: 4
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: index === 0 ?
                'Số tiền giải ngân tháng này (tính theo hạn chót)' :
                'Số tiền giải ngân tháng sau (tính theo hạn chót)'
            },
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: '(nghìn đồng)'
              }
            },
            y: {
              stacked: true,
              display: false
            }
          }
        }
      });

      this.monthlyCharts.push(chart);
    });
  }
}
