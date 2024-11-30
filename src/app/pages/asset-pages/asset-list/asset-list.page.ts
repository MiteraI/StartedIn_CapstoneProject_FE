import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { NzPaginationModule } from 'ng-zorro-antd/pagination'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { catchError, finalize, Subject, switchMap, takeUntil, throwError } from 'rxjs'
import { AssetFilterComponent } from 'src/app/components/asset-pages/asset-filter/asset-filter.component'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ScrollService } from 'src/app/core/util/scroll.service'
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component'
import { AssetService } from 'src/app/services/asset.service'
import { AssetStatus, AssetStatusLabels } from 'src/app/shared/enums/asset-status.enum'
import { AssetModel } from 'src/app/shared/models/asset/asset.model'
import { format } from 'date-fns'
import { VndCurrencyPipe } from '../../../shared/pipes/vnd-currency.pipe'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { CreateAssetModalComponent } from 'src/app/components/asset-pages/create-asset-modal/create-asset-modal.component'
import { UpdateAssetModalComponent } from 'src/app/components/asset-pages/update-asset-modal/update-asset-modal.component'

interface FilterOptions {
  assetName?: string
  fromPrice?: number
  toPrice?: number
  status?: AssetStatus
  serialNumber?: string
  fromDate?: Date
  toDate?: Date
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
    FilterBarComponent,
    AssetFilterComponent,
    MatIconModule,
    RouterModule,
    NzPaginationModule,
    NzSpinModule,
    VndCurrencyPipe,
    AssetFilterComponent,
  ],
})
export class AssetListPage implements OnInit, OnDestroy {
  projectId!: string

  assets: AssetModel[] = []
  filter: FilterOptions = {}
  pageIndex: number = 1
  pageSize: number = 20
  totalRecords: number = 200

  assetStatuses = AssetStatus
  statusLabels = AssetStatusLabels

  isLoading = false
  isDesktopView = false

  isLeader = false

  @ViewChild(AssetFilterComponent) filterComponent!: AssetFilterComponent
  private destroy$ = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private assetService: AssetService,
    private notification: NzNotificationService,
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService,
    private roleService: RoleInTeamService
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((map) => {
      if (!map.get('id')) {
        return
      }
      this.projectId = map.get('id')!
      this.filterAssets()
    })
    this.viewMode.isDesktopView$.subscribe((isDesktop) => {
      this.isDesktopView = isDesktop
    })
    this.scrollService.scroll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadMore()
    })
    this.roleService.role$.subscribe((role) => {
      this.isLeader = role?.roleInTeam === TeamRole.LEADER
      this.filterAssets()
    })
    this.assetService.refreshAsset$.pipe()
    .subscribe(() => {
      this.filterAssets();
    });
  }
  filterAssets(append: boolean = false) {
    this.isLoading = true
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
        this.filter.toDate
      )
      .pipe(
        catchError((error) => {
          this.notification.error('Lỗi', 'Lấy danh sách tài sản thất bại!', { nzDuration: 2000 })
          return throwError(() => new Error(error.error))
        })
      )
      .subscribe((result) => {
        this.assets = append ? [...this.assets, ...result.data] : result.data
        this.totalRecords = result.total
        this.isLoading = false
      })
  }

  get filterData() {
    return {
      ...this.filter,
      id: this.projectId,
    }
  }
  onFilterApplied(filterResult: any) {
    this.filter = { ...filterResult }
    this.pageIndex = 1
    this.filterAssets()
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter)
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      assetName: searchText,
    }
    this.pageIndex = 1
    this.filterAssets()
  }

  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords
  }

  openAddModal() {
    this.modalService.create({
      nzTitle: 'Tài sản mới',
      nzContent: CreateAssetModalComponent,
      nzFooter: null,
      nzData: this.projectId,
    })
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy')
  }

  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return

    this.pageIndex++
    this.filterAssets(true)
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index
    this.filterAssets()
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size
    this.pageIndex = 1
    this.filterAssets()
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  openDeleteModal(asset: AssetModel) {
    this.modalService.confirm({
      nzTitle: 'Bạn có muốn xóa tài sản này không?',
      nzContent: '<b style="color: red;">Tài sản đã xóa không thể hoàn tác</b>',
      nzOkText: 'Có',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteAsset(asset),
      nzCancelText: 'Không',
      nzOnCancel: () => console.log(this.assets),
    })
  }

  openUpdateAssetModel(assetId: string) {
    const modalRef = this.modalService.create({
      nzTitle: 'Thông Tin Tài sản',
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px' },
      nzContent: UpdateAssetModalComponent,
      nzData: {
        assetId: assetId ,
        projectId: this.projectId,
        assetList: this.assets,
      },
      nzFooter: null,
    })
  }

  deleteAsset(asset: AssetModel) {
    this.assetService.deleteAsset(this.projectId, asset.id).subscribe(() => {
      this.notification.success('Thành công', 'Xóa tài sản thành công!', { nzDuration: 2000 })
      this.filterAssets()
    })
  }
}
