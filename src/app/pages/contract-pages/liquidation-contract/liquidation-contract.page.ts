import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectModel } from 'src/app/shared/models/project/project.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ContractService } from 'src/app/services/contract.service';
import { catchError, Subject, throwError } from 'rxjs';
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum';
import { AccountService } from 'src/app/core/auth/account.service';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { ContractHistorySidebarComponent } from 'src/app/components/contract-pages/contract-history-sidebar/contract-history-sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { LiquidationContractDetailModel } from 'src/app/shared/models/contract/liquidation-contract-detail.model';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { ContractStatus } from 'src/app/shared/enums/contract-status.enum';
import { ContractType } from 'src/app/shared/enums/contract-type.enum';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-liquidation-contract',
  templateUrl: './liquidation-contract.page.html',
  styleUrls: ['./liquidation-contract.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzListModule,
    NzModalModule,
    NzIconModule,
    NzSelectModule,
    NzInputNumberModule,
    ContractHistorySidebarComponent,
    MatIconModule,
    NzAvatarModule,
    InitialsOnlyPipe
  ],
})
export class LiquidationContractPage implements OnInit, OnDestroy {
  isReadOnly = false;
  private destroy$ = new Subject<void>();

  project!: ProjectModel;
  contract: LiquidationContractDetailModel | null = null;
  contractId: string | null = null;

  roleInTeam = TeamRole
  roleInTeamLabels = TeamRoleLabels

  contractStatus = ContractStatus

  isLoading: boolean = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private contractService: ContractService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.project = data['project'];
      this.contract = data['contract'];
      if (this.contract) {
        this.contractId = this.contract.id;
      }
    });
  }

  getParentContractNumber() {
    return this.contract?.contractName.split(' ').pop();
  }

  send() {
    this.isLoading = true;
    this.contractService
      .sendContract(this.contractId!, this.project.id)
      .pipe(
        catchError((error) => {
          this.notification.error('Lỗi', 'Gửi hợp đồng thất bại!', { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe((response) => {
        this.isLoading = false;
        this.notification.success('Thành công', 'Gửi hợp đồng thành công!', { nzDuration: 2000 });
        this.router.navigate(['projects', this.project.id, 'contracts']);
      });
  }

  download() {
    this.isLoading = true;
    this.contractService
      .downloadContract(this.contractId!, this.project.id)
      .pipe(
        catchError((error) => {
          this.notification.error('Lỗi', 'Tải hợp đồng thất bại!', { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe((response) => {
        this.isLoading = false;
        window.open(response.downLoadUrl, '_blank');
      });
  }

  navigateToParentContract(contract: LiquidationContractDetailModel) {
    this.router.navigate([
      '/projects',
      this.project.id,
      contract.parentContractType === ContractType.INVESTMENT ? 'investment-contract' :
      contract.parentContractType === ContractType.INTERNAL ? 'internal-contract' : '',
      contract.parentContractId
    ])
  }

  navigateBack() {
    this.location.back();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
