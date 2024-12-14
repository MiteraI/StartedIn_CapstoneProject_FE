import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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
import { catchError, Observable, Subject, takeUntil, throwError } from 'rxjs';
import { ProjectService } from 'src/app/services/project.service';
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum';
import { AccountService } from 'src/app/core/auth/account.service';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { ContractHistorySidebarComponent } from 'src/app/components/contract-pages/contract-history-sidebar/contract-history-sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { LiquidationContractDetailModel } from 'src/app/shared/models/contract/liquidation-contract-detail.model';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { ContractStatus, ContractStatusLabels } from 'src/app/shared/enums/contract-status.enum';

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

  private currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private contractService: ContractService,
    private projectService: ProjectService,
    private notification: NzNotificationService,
    private accountService: AccountService,
    private roleService: RoleInTeamService,
  ) {}

  ngOnInit() {
    this.accountService.account$.pipe(takeUntil(this.destroy$)).subscribe((account) => {
      if (account) {
        this.currentUserId = account.id;
      }
    });

    this.roleService.role$.subscribe((role) => {
    });

    this.route.data.subscribe((data) => {
      this.project = data['project'];
      this.contract = data['contract'];
      if (this.contract) {
        this.contractId = this.contract.id;
      }
    });
  }


  send() {
    this.contractService
        .sendContract(this.contractId!, this.project.id)
        .pipe(
          catchError((error) => {
            this.notification.error('Lỗi', 'Gửi hợp đồng thất bại!', { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe((response) => {
          this.notification.success('Thành công', 'Gửi hợp đồng thành công!', { nzDuration: 2000 });
          this.router.navigate(['projects', this.project.id, 'contracts']);
        });
  }

  showPreview() {
    alert('not implemented');
  }

  download() {
    this.contractService
      .downloadContract(this.contractId!, this.project.id)
      .pipe(
        catchError((error) => {
          this.notification.error('Lỗi', 'Tải hợp đồng thất bại!', { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe((response) => {
        window.open(response.downLoadUrl, '_blank');
      });
  }

  navigateBack() {
    this.location.back();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
