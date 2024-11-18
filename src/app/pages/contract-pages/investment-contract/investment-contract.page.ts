import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DisbursementCreateModel } from 'src/app/shared/models/disbursement/disbursement-create.model';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { InvestmentContractCreateUpdateModel } from 'src/app/shared/models/contract/investment-contract-create-update.model';
import { ProjectModel } from 'src/app/shared/models/project/project.model';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { CreateDisbursementFormComponent } from 'src/app/components/contract-pages/create-disbursement-form/create-disbursement-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ContractService } from 'src/app/services/contract.service';
import { catchError, Observable, throwError } from 'rxjs';
import { ProjectDealItem } from 'src/app/shared/models/deal-offer/project-deal-item.model';
import { ContractCreateFromDealModel } from 'src/app/shared/models/contract/contract-create-from-deal.model';
import { InvestmentContractDetailModel } from 'src/app/shared/models/contract/investment-contract-detail.model';
import { ContractStatus } from 'src/app/shared/enums/contract-status.enum';
import { MobileTitleBarComponent } from 'src/app/layouts/mobile-title-bar/mobile-title-bar.component';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';

@Component({
  selector: 'app-investment-contract',
  templateUrl: './investment-contract.page.html',
  styleUrls: ['./investment-contract.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzModalModule,
    NzListModule,
    NzIconModule,
    NzInputNumberModule,
    IonicModule,
    VndCurrencyPipe,
    MobileTitleBarComponent
  ]
})
export class InvestmentContractPage implements OnInit {
  isReadOnly = false;
  isFromDeal = false;

  project!: ProjectModel;
  contract: InvestmentContractDetailModel | null = null;
  contractId: string | null = null;
  deal: ProjectDealItem | null = null;
  investorId!: string;

  contractForm!: FormGroup;
  percentFormatter = (value: number) => `${value}%`;
  percentParser = (value: string) => value.replace('%', '');
  vndCurrencyPipe!: VndCurrencyPipe;
  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value);
  vndParser = (value: string) => value.replace(/\D/g,''); // remove all non-digits

  disbursements: DisbursementCreateModel[] = [];
  disbursementTotalAmount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private contractService: ContractService,
    private notification: NzNotificationService,
    private roleService: RoleInTeamService
  ) {}

  ngOnInit() {
    this.vndCurrencyPipe = new VndCurrencyPipe();
    this.contractForm = this.fb.group({
      contractName: ['', [Validators.required]],
      contractPolicy: [''],
      contractIdNumber: ['', [Validators.required]],
      shareQuantity: [0, [Validators.required]],
      percentage: [0, [Validators.required]],
      buyPrice: [0, [Validators.required]]
    });

    this.roleService.role$.subscribe(role => {
      if (role !== TeamRole.LEADER) {
        this.contractForm.disable();
      }
    });

    this.route.data.subscribe(data => {
      this.project = data['project'];
      this.contract = data['contract'];
      this.deal = data['deal'];

      if (!!this.contract) {
        // import data
        this.isFromDeal = !!this.contract.dealOfferId;
        this.isReadOnly = !(this.contract.contractStatus === ContractStatus.DRAFT);
        if (this.isReadOnly) {
          this.contractForm.disable();
        }
        this.investorId = this.contract.investorId;
        this.contractId = this.contract.id;
        const shareQuantity = Math.round(this.project.totalShares * this.contract.sharePercentage / 100);
        this.contractForm.patchValue({
          contractName: this.contract.contractName,
          contractPolicy: this.contract.contractPolicy,
          contractIdNumber: this.contract.contractIdNumber,
          shareQuantity: shareQuantity,
          percentage: this.contract.sharePercentage,
          buyPrice: this.contract.buyPrice
        })
        this.disbursements = this.contract.disbursements.map(d => {
          const {id, ...rest} = d;
          return rest;
        })
        this.disbursementTotalAmount = this.disbursements.reduce((total, disbursement) => total + (disbursement.amount || 0), 0);
      } else if (!!this.deal) {
        this.isFromDeal = true;
        this.investorId = this.deal.investorId;
        const shareQuantity = Math.round(this.project.totalShares * this.deal.equityShareOffer / 100);
        this.contractForm.patchValue({
          shareQuantity: shareQuantity,
          percentage: this.deal.equityShareOffer,
          buyPrice: this.deal.amount
        })
      } else {
        this.route.queryParamMap.subscribe(value => {
          if (!value.get('investorId')) {
            this.navigateBack();
          }
          this.investorId = value.get('investorId')!;
        })
      }
    });
  }

  updateShareQuantity() {
    this.contractForm.patchValue({shareQuantity: Math.round(this.project.totalShares * this.contractForm.value.percentage / 100)});
  }

  updateSharePercentage() {
    this.contractForm.patchValue({percentage: (this.contractForm.value.shareQuantity / this.project.totalShares * 100).toFixed(2)});
  }

  openDisbursementModal(disbursement?: DisbursementCreateModel, index?: number) {
    const isEdit = disbursement !== undefined;

    this.modalService.create({
      nzTitle: isEdit ? 'Sửa lần giải ngân' : 'Thêm lần giải ngân',
      nzContent: CreateDisbursementFormComponent,
      nzData: isEdit ? {...disbursement} : {
        title: '',
        startDate: null,
        endDate: null,
        amount: null,
        condition: ''
      },
      nzCancelText: "Hủy",
      nzOnOk: (componentInstance) => {
        const formValue = componentInstance.disbursementForm.value;
        formValue.startDate = formValue.startDate.toISOString().substring(0, 10);
        formValue.endDate = formValue.endDate.toISOString().substring(0, 10);

        if (isEdit) {
          // Update total amount
          this.disbursementTotalAmount += formValue.amount - this.disbursements[index!].amount;
          // Create new array with the updated item
          this.disbursements = [
            ...this.disbursements.slice(0, index),
            formValue,
            ...this.disbursements.slice(index! + 1)
          ];
        } else {
          // Update total amount
          this.disbursementTotalAmount += formValue.amount;
          // Create new array with the added item
          this.disbursements = [...this.disbursements, formValue];
        }
      }
    });
  }

  removeDisbursement(index: number): void {
    this.disbursements = [
      ...this.disbursements.slice(0, index),
      ...this.disbursements.slice(index + 1)
    ];
  }

  save() {
    this.createOrUpdateContract().subscribe(response => this.contractId = response.id);
  }

  saveAndSend() {
    if (!this.contractForm.valid) {
      return;
    }
    this.createOrUpdateContract()
      .subscribe(response => {
        this.contractId = response.id;
        this.contractService
          .sendContract(this.contractId!, this.project.id)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Gửi thỏa thuận thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(response => this.router.navigate(['projects', this.project.id, 'contracts']))
      })
  }

  createOrUpdateContract(): Observable<any> {
    var o: Observable<any>;
    if (!this.contractId) {
      // Create contract
      if (this.deal !== null) {
        // From deal
        o = this.contractService
          .createInvestmentContractFromDeal(this.project.id, this.contractFromDealModel)
      } else {
        // Not from deal
        o = this.contractService
          .createInvestmentContract(this.project.id, this.contractModel)
      }
    } else {
      // Update contract
      o = this.contractService
        .updateInvestmentContract(this.contractId, this.project.id, this.contractModel)
    }
    return o.pipe(
      catchError(error => {
        this.notification.error("Lỗi", "Lưu dữ liệu thỏa thuận thất bại!", { nzDuration: 2000 });
        return throwError(() => new Error(error.error));
      })
    );
  }

  get contractModel(): InvestmentContractCreateUpdateModel {
    return {
      contract: {
        contractName: this.contractForm.value.contractName || 'Hợp đồng chưa có tên',
        contractPolicy: this.contractForm.value.contractPolicy || '',
        contractIdNumber: this.contractForm.value.contractIdNumber || ''
      },
      investorInfo: {
        userId: this.investorId,
        shareQuantity: this.contractForm.value.shareQuantity,
        percentage: this.contractForm.value.percentage,
        buyPrice: this.contractForm.value.buyPrice,
      },
      disbursements: this.disbursements
    };
  }

  get contractFromDealModel(): ContractCreateFromDealModel {
    return {
      dealId: this.deal!.id,
      contract: {
        contractName: this.contractForm.value.contractName || 'Hợp đồng chưa có tên',
        contractPolicy: this.contractForm.value.contractPolicy || '',
        contractIdNumber: this.contractForm.value.contractIdNumber || ''
      },
      disbursements: this.disbursements
    };
  }

  showPreview() {
    alert('not implemented');
  }

  download() {
    this.contractService
      .downloadContract(this.contractId!, this.project.id)
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

  navigateBack() {
    this.location.back();
  }
}
