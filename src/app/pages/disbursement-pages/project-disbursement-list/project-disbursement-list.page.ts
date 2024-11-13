import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { format, isToday, isYesterday } from 'date-fns';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DisbursementService } from 'src/app/services/disbursement.service';
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';
import { ProjectDisbursementItemModel } from 'src/app/shared/models/disbursement/project-disbursement-item.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { DisbursementStatus, DisbursementStatusLabels } from 'src/app/shared/enums/disbursement-status.enum';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { RejectDisbursementFormComponent } from 'src/app/components/disbursement-pages/reject-disbursement-form/reject-disbursement-form.component';

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
    MatIconModule,
    RouterModule,
    VndCurrencyPipe
  ]
})
export class ProjectDisbursementListPage implements OnInit {
  projectId!: string;
  searchResult: SearchResponseModel<ProjectDisbursementItemModel> = {
    data: [],
    page: 1,
    size: 10,
    total: 0
  };

  disbursements: ProjectDisbursementItemModel[] = [];
  selectedDisbursements: ProjectDisbursementItemModel[] = [];
  keys: string[] = [];
  disbursementGroups: ProjectDisbursementItemModel[][] = [];

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 10;

  disbursementStatuses = DisbursementStatus;
  statusLabels = DisbursementStatusLabels;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private disbursementService: DisbursementService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(map => {
      if (!map.get('id')) {
        return;
      }
      this.projectId = map.get('id')!;
      this.filterDisbursements();
    });
  }

  filterDisbursements() {
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
        this.searchResult = result;
        console.log(result);
        this.disbursements = result.data;
        this.groupDisbursements();
      });
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      name: searchText
    };
    this.filterDisbursements();
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

  openRejectModal(disbursement: ProjectDisbursementItemModel) {
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

  rejectDisbursement(disbursement: ProjectDisbursementItemModel, reason: string) {
    // TODO: Implement reject disbursement API call
    console.log('Rejecting disbursement:', disbursement.id, 'Reason:', reason);
  }

  disburseFunds(disbursement: ProjectDisbursementItemModel) {
    this.modalService.confirm({
      nzTitle: 'Xác nhận giải ngân',
      nzContent: `Bạn có chắc chắn muốn giải ngân ${disbursement.amount} VND cho ${disbursement.investorName}?`,
      nzOkText: 'Giải ngân',
      nzOkType: 'primary',
      nzOnOk: () => {
        // TODO: Implement disburse funds API call
        console.log('Disbursing funds:', disbursement.id);
      }
    });
  }
}
