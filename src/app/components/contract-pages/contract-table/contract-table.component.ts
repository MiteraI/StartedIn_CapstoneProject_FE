import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ContractService } from 'src/app/services/contract.service';
import { ContractStatus, ContractStatusLabels } from 'src/app/shared/enums/contract-status.enum';
import { ContractType, ContractTypeLabels } from 'src/app/shared/enums/contract-type.enum';
import { DisbursementStatus, DisbursementStatusLabels } from 'src/app/shared/enums/disbursement-status.enum';
import { ContractListItemModel } from 'src/app/shared/models/contract/contract-list-item.model';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { format } from 'date-fns';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { catchError, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { TerminateContractModalComponent } from '../terminate-contract-modal/terminate-contract-modal.component';
import { LiquidationModalComponent } from '../liquidation-modal/liquidation-modal.component';

@Component({
  selector: 'app-contract-table',
  templateUrl: './contract-table.component.html',
  styleUrls: ['./contract-table.component.scss'],
  standalone: true,
  imports: [
    NzTableModule,
    RouterModule,
    NzDividerModule,
    MatIconModule,
    NzButtonModule,
    NzModalModule,
    CommonModule,
    NzAvatarModule,
    InitialsOnlyPipe,
    NzPopconfirmModule,
    VndCurrencyPipe
  ],
})

export class ContractTableComponent  implements OnInit {
  @Input({ required: true }) projectId!: string
  @Input({ required: true }) listContract: SearchResponseModel<ContractListItemModel> = {
    data: [],
    page: 1,
    size: 10,
    total: 0
  }
  @Input({ required: true }) isFetchAllContractLoading: boolean = false
  @Output() refreshNeeded = new EventEmitter<void>();

  isLeader = false;
  constructor(
    private contractService: ContractService,
    private modalService: NzModalService,
    private router: Router,
    private roleService: RoleInTeamService,
    private notification: NzNotificationService) { }

  ngOnInit() {
    this.roleService.role$.subscribe(role => {
      this.isLeader = role === TeamRole.LEADER;
    });
  }

  getContractTypeLabel(type: ContractType) : string {
    return ContractTypeLabels[type]
  }

  getContractStatusLabel(status: ContractStatus): string {
    return ContractStatusLabels[status]
  }

  getDisbursementStatusLabel(status: DisbursementStatus) : string {
    return DisbursementStatusLabels[status]
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'HH:mm dd/MM/yyyy');
  }

  formatDateOnly(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy');
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
        contract.contractStatus = ContractStatus.SENT;
        contract.lastUpdatedTime = new Date().toISOString();
        this.notification.success("Thành công", "Gửi hợp đồng thành công!", { nzDuration: 2000 });
      });
  }

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
        this.listContract.data = this.listContract.data.filter(c => c.id !== contract.id)
        this.notification.success("Thành công", "Xóa hợp đồng thành công!", { nzDuration: 2000 });
      });
  }

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
        contract.contractStatus = 5;
        contract.lastUpdatedTime = new Date().toISOString();
        this.notification.success("Thành công", "Kết thúc hợp đồng thành công!", { nzDuration: 2000 });
      });
  }

  openTerminateModal(contract: ContractListItemModel) {
    this.modalService.create({
      nzTitle: 'Kết thúc hợp đồng',
      nzContent: TerminateContractModalComponent,
      nzData: { projectId: this.projectId, contractId: contract.id, isLeader: this.isLeader },
      nzFooter: null,
      nzOnOk: () => this.refreshNeeded.emit()
    });
  }

  openLiquidationModal(contract: ContractListItemModel) {
    if (contract.liquidationNoteId) {
      this.router.navigate([
        '/projects',
        this.projectId,
        'liquidation-contract',
        contract.liquidationNoteId
      ]);
    }
    this.modalService.create({
      nzTitle: 'Thanh lý hợp đồng',
      nzContent: LiquidationModalComponent,
      nzData: { projectId: this.projectId, contractId: contract.id },
      nzFooter: null,
      nzOnOk: () => this.refreshNeeded.emit()
    });
  }

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
}
