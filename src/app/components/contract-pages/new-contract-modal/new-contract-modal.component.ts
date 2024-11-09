import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { ContractType, ContractTypeLabels } from 'src/app/shared/enums/contract-type.enum';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectDealItem } from 'src/app/shared/models/deal-offer/project-deal-item.model';
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { DealStatus } from 'src/app/shared/enums/deal-status.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-contract-modal',
  templateUrl: 'new-contract-modal.component.html',
  styleUrls: ['new-contract-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzRadioModule,
    NzSelectModule,
    NzButtonModule,
    NzInputModule,
    NzAvatarModule,
    NzIconModule,
    InitialsOnlyPipe,
    VndCurrencyPipe
  ]
})
export class NewContractModalComponent implements OnInit {
  touched: boolean = false;
  contractTypeOptions = Object.values(ContractType)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as ContractType,
      label: ContractTypeLabels[value as ContractType]
    }));

  seletedType: ContractType = ContractType.INVESTMENT;
  isFromDeal: boolean = true;

  dealList: ProjectDealItem[] = [];
  selectedDealId: string | null = null;
  investorList: TeamMemberModel[] = [];
  selectedInvestorId: string | null = null;

  constructor(
    private modal: NzModalRef,
    @Inject(NZ_MODAL_DATA) private projectId: string,
    private notification: NzNotificationService,
    private dealOfferService: DealOfferService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit() {
    this.dealOfferService
      .getProjectDealList(this.projectId, 1, 100)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách thỏa thuận thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(response => this.dealList = response.responseList.filter(d => d.dealStatus === DealStatus.ACCEPTED));

    this.projectService
      .getMembers(this.projectId)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách nhà đầu tư thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(response => this.investorList = response.filter(m => m.roleInTeam === TeamRole.INVESTOR));
  }

  isValid(): boolean {
    if (this.seletedType === ContractType.INVESTMENT) {
      return (this.isFromDeal && !!this.selectedDealId)
        || (!this.isFromDeal && !!this.selectedInvestorId)
    } else {
      return true;
    }
  }

  navigateToCreateContract() {
    if (this.seletedType === ContractType.INVESTMENT) {
      if (this.isFromDeal) {
        this.router.navigate(
          ['/projects', this.projectId, 'create-investment-contract'],
          {queryParams: {dealId: this.selectedDealId}}
        );
      } else {
        this.router.navigate(
          ['/projects', this.projectId, 'create-investment-contract'],
          {queryParams: {investorId: this.selectedInvestorId}}
        );
      }
      this.modal.close();
    } else {

    }
  }

  dismiss() {
    this.modal.close();
  }
}
