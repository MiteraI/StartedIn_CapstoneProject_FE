import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { NzPaginationModule } from "ng-zorro-antd/pagination";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { catchError, Subject, takeUntil, throwError } from "rxjs";
import { AssetFilterComponent } from "src/app/components/asset-pages/asset-filter/asset-filter.component";
import { ContractFilterComponent } from "src/app/components/contract-pages/contract-filter/contract-filter.component";
import { ViewModeConfigService } from "src/app/core/config/view-mode-config.service";
import { ScrollService } from "src/app/core/util/scroll.service";
import { FilterBarComponent } from "src/app/layouts/filter-bar/filter-bar.component";
import { AssetService } from "src/app/services/asset.service";
import { AssetStatus, AssetStatusLabels } from "src/app/shared/enums/asset-status.enum";
import { AssetModel } from "src/app/shared/models/asset/asset.model";
import { InitialsOnlyPipe } from "src/app/shared/pipes/initials-only.pipe";
import { format } from 'date-fns';
import { VndCurrencyPipe } from "../../../shared/pipes/vnd-currency.pipe";

interface FilterOptions {
  assetName?: string;
  fromPrice?: number;
  toPrice?: number;
  status?: AssetStatus;
  serialNumber?: string;
  fromDate?: Date;
  toDate?: Date;
}

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.page.html',
  styleUrls: ['./asset-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    NzModalModule,
    InitialsOnlyPipe,
    FilterBarComponent,
    AssetFilterComponent,
    MatIconModule,
    RouterModule,
    NzPaginationModule,
    NzSpinModule,
    VndCurrencyPipe,
    AssetFilterComponent
]
})

export class AssetListPage implements OnInit, OnDestroy {
  
  projectId!: string;

  assets: AssetModel[] = [];
  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRecords: number = 200;

  assetStatuses = AssetStatus;
  statusLabels = AssetStatusLabels;

  isLoading = false;
  isDesktopView = false;

  isLeader = false;
  
  @ViewChild(AssetFilterComponent) filterComponent!: AssetFilterComponent;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private assetService: AssetService,
    private notification: NzNotificationService,
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService,
  ) {}
  
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(map => {
      if (!map.get('id')) {
        return;
      }
      this.projectId = map.get('id')!;
      this.filterAssets();
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
  filterAssets(append: boolean = false) {
    this.isLoading = true;
    this.assetService
      .getAssetListForProject(
        this.projectId,
        this.pageIndex,
        this.pageSize,
        this.filter.assetName,
        this.filter.fromPrice,
        this.filter.toPrice,
        this.filter.status,
        this.filter.serialNumber,
        this.filter.fromDate,
        this.filter.toDate,
      )
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách tài sản thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.assets = append ? [...this.assets, ...result.data] : result.data;
        this.totalRecords = result.total;
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
    this.filterAssets();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }
  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      assetName: searchText
    };
    this.filterAssets();
  }

  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy');
  }

  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return;

    this.pageIndex++;
    this.filterAssets(true);
  }
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.filterAssets();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.filterAssets();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}