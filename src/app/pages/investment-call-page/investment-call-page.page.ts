import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ViewTitleBarComponent } from '../../layouts/view-title-bar/view-title-bar.component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { MatIconModule } from '@angular/material/icon'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { Subject, switchMap, takeUntil, finalize, catchError, throwError } from 'rxjs'
import { NzModalService } from 'ng-zorro-antd/modal'
import { ActivatedRoute } from '@angular/router'
import { CreateInvestmentCallModalComponent } from 'src/app/components/investment-call-page/create-investment-call-modal/create-investment-call-modal.component'
import { InvestmentCallTableComponent } from 'src/app/components/investment-call-page/investment-call-table/investment-call-table.component'
import { InvestmentCallService } from 'src/app/services/investment-call.service'
import { InvestmentCallResponseDto } from 'src/app/shared/models/investment-call/investment-call-response-dto.model'
import { InvestmentCallListComponent } from 'src/app/components/investment-call-page/investment-call-list/investment-call-list.component'
import { ProjectService } from 'src/app/services/project.service'
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model'
import { InvestmentCallLabel, InvestmentCallStatus } from 'src/app/shared/enums/investment-call-status.enum'
import { InvestmentCallFilterComponent } from 'src/app/components/investment-call-page/investment-call-filter/investment-call-filter.component'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { ScrollService } from 'src/app/core/util/scroll.service'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { SearchResponseModel } from 'src/app/shared/models/search-response.model'
import { NzPaginationModule } from 'ng-zorro-antd/pagination'
import { FilterBarComponent } from "../../layouts/filter-bar/filter-bar.component";
import { ContractFilterComponent } from "../../components/contract-pages/contract-filter/contract-filter.component";

interface FilterOptions 
{
  startDate?: Date;
  endDate?: Date;
  status?: InvestmentCallStatus;
  fromAmountRaised?: number;
  toAmountRaised?: number;
  fromEquityShareCall?: number;
  toEquityShareCall?: number;
  fromTargetCall?: number;
  toTargetCall?: number;
}

@Component({
  selector: 'app-investment-call-page',
  templateUrl: './investment-call-page.page.html',
  styleUrls: ['./investment-call-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewTitleBarComponent,
    NzButtonModule,
    MatIconModule,
    InvestmentCallTableComponent,
    InvestmentCallListComponent,
    NzPaginationModule,
    FilterBarComponent,
    InvestmentCallFilterComponent,
],
})
export class InvestmentCallPagePage implements OnInit {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()
  projectId = ''
  listInvestmentCall: SearchResponseModel<InvestmentCallResponseDto> = {
      data: [],
      page: 1,
      size: 10,
      total: 0
  };
  investmentCalls: InvestmentCallResponseDto[] = [];

  isFetchAllCallLoading: boolean = false
  currentProject: ProjectOveriewModel | undefined

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRecords: number = 200;

  investmentCallStatuses = InvestmentCallStatus;
  statusLabels = InvestmentCallLabel;

  isLeader = false;
  isLoading = false;

  @ViewChild(InvestmentCallFilterComponent) filterComponent!: InvestmentCallFilterComponent

  constructor(
    private viewMode: ViewModeConfigService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private investmentCallService: InvestmentCallService,
    private projectService: ProjectService,
    private roleService: RoleInTeamService,
    private scrollService: ScrollService,
    private notification: NzNotificationService,
    
  ) {}

  ngOnInit() {
    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
      this.roleService.role$.subscribe(role => {
        this.isLeader = role === TeamRole.LEADER;
        this.filterInvestmentCalls();
      });
    });
    this.scrollService.scroll$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadMore());
    // fetch the data again when create new item
    // this.investmentCallService.refreshInvestmentCall$
    //   .pipe(
    //     switchMap(() => {
    //       this.isFetchAllCallLoading = true
    //       return this.investmentCallService.getInvestmentCallList(this.projectId).pipe(finalize(() => (this.isFetchAllCallLoading = false)))
    //     })
    //   )
    //   .subscribe((investmentCall) => {
    //     this.listInvestmentCall = investmentCall
    //   })

    // this.fetchInvestmentCalls()
    // this.fetchCurrentProject()
  }

  // private fetchInvestmentCalls() {
  //   this.isFetchAllCallLoading = true
  //   this.investmentCallService.getInvestmentCallList(this.projectId).subscribe((data) => {
  //     console.log(data)
  //     this.listInvestmentCall = data
  //     this.isFetchAllCallLoading = false
  //   })
  // }

  // private fetchCurrentProject() {
  //   this.projectService.getProjectOverview(this.projectId).subscribe((data) => {
  //     this.currentProject = data
  //   })
  // }
  filterInvestmentCalls(append: boolean = false) {
    this.isLoading = true;
      this.investmentCallService
        .getInvestmentCallList(
          this.projectId,
          this.pageIndex,
          this.pageSize,
          this.filter.startDate,
          this.filter.endDate,
          this.filter.status,
          this.filter.fromAmountRaised,
          this.filter.toAmountRaised,
          this.filter.fromEquityShareCall,
          this.filter.toEquityShareCall,
          this.filter.fromTargetCall,
          this.filter.toTargetCall
        )
        .pipe(
          catchError(error => {
            this.notification.error("Lỗi", "Lấy danh sách gọi vốn thất bại!", { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(result => {
          // Update listContract with the new data
          this.listInvestmentCall = {
            data: append ? [...this.listInvestmentCall.data, ...result.data] : result.data,
            page: this.pageIndex,
            size: this.pageSize,
            total: result.total
          };
          this.totalRecords = this.listInvestmentCall.total;
          this.isLoading = false;
        });
  }

  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords
  }


  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return;

    this.pageIndex++;
    this.filterInvestmentCalls(true);
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.filterInvestmentCalls();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.filterInvestmentCalls();
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
    this.filterInvestmentCalls();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }

  openCreateInvestmentCallModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Đợt Gọi Vốn Mới',
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px' },
      nzContent: CreateInvestmentCallModalComponent,
      nzData: {
        projectId: this.projectId,
        currentProject: this.currentProject,
      },
      nzFooter: null,
    })
  }
}
