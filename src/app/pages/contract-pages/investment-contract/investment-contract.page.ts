import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DisbursementCreateModel } from 'src/app/shared/models/disbursement/disbursement-create.model';
import { CommonModule } from '@angular/common';
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ContractService } from 'src/app/services/contract.service';
import { catchError, Observable, throwError } from 'rxjs';
import { ProjectDealItem } from 'src/app/shared/models/deal-offer/project-deal-item.model';
import { ContractCreateFromDealModel } from 'src/app/shared/models/contract/contract-create-from-deal.model';
import { InvestmentContractDetailModel } from 'src/app/shared/models/contract/investment-contract-detail.model';
import { ContractStatus, ContractStatusLabels } from 'src/app/shared/enums/contract-status.enum';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { ContractHistorySidebarComponent } from 'src/app/components/contract-pages/contract-history-sidebar/contract-history-sidebar.component';
import { PercentFormatterPipe } from 'src/app/shared/pipes/percentage.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MeetingLabel, MeetingStatus } from 'src/app/shared/enums/meeting-status.enum';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { EDITOR_KEY } from 'src/app/shared/constants/editor-key.constants';
import { LiquidationModalComponent } from 'src/app/components/contract-pages/liquidation-modal/liquidation-modal.component';
import { TerminateContractModalComponent } from 'src/app/components/contract-pages/terminate-contract-modal/terminate-contract-modal.component';
import { TerminateMeetingModalComponent } from 'src/app/components/contract-pages/terminate-meeting-modal/terminate-meeting-modal.component';


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
    VndCurrencyPipe,
    ContractHistorySidebarComponent,
    PercentFormatterPipe,
    MatIconModule,
    RouterModule,
    EditorModule
  ]
})
export class InvestmentContractPage implements OnInit {
  project!: ProjectModel;
  contract: InvestmentContractDetailModel | null = null;
  contractId: string | null = null;
  deal: ProjectDealItem | null = null;
  investorId!: string;

  contractStatus = ContractStatus;
  meetingStatus = MeetingStatus;
  statusLabels = ContractStatusLabels;
  meetingLabels = MeetingLabel;

  contractForm!: FormGroup;
  editorKey = EDITOR_KEY;
  init: EditorComponent['init'] = {
    branding: false,
    plugins: 'lists link code help wordcount image',
    toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | help',
    setup: () => this.onInfoChange()
  };

  percentFormatter = (value: number) => `${value}%`;
  percentParser = (value: string) => value.replace('%', '');
  vndCurrencyPipe: VndCurrencyPipe = new VndCurrencyPipe();
  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value);
  vndParser = (value: string) => value.replace(/\D/g,''); // remove all non-digits

  disbursements: DisbursementCreateModel[] = [];
  disbursementTotalAmount: number = 0;

  isLoading: boolean = false;
  isReadOnly = false;
  isLeader = false;
  isFromDeal = false;
  isUpdating = false;

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
    this.contractForm = this.fb.group({
      contractName: ['', [Validators.required]],
      contractPolicy: [''],
      contractIdNumber: ['', [Validators.required]],
      percentage: [0, [Validators.required]],
      buyPrice: [100000000, [Validators.required]]
    });

    this.roleService.role$.subscribe(role => {
      this.isLeader = role === TeamRole.LEADER;
      if (role && role !== TeamRole.LEADER) {
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
        this.contractForm.patchValue({
          contractName: this.contract.contractName,
          contractPolicy: this.contract.contractPolicy,
          contractIdNumber: this.contract.contractIdNumber,
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
        this.contractForm.patchValue({
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

  onInfoChange() {
    this.isUpdating = true;
  }

  openDisbursementModal(disbursement?: DisbursementCreateModel, index?: number) {
    const isEdit = disbursement !== undefined;

    this.modalService.create({
      nzTitle: isEdit ? 'Sửa lần giải ngân' : 'Thêm lần giải ngân',
      nzContent: CreateDisbursementFormComponent,
      nzData: {
        disbursement,
        projectStartDate: new Date(this.project.startDate),
        projectEndDate: this.project.endDate ? new Date(this.project.endDate) : null
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
    this.isLoading = true;
    this.createOrUpdateContract().subscribe(response => {
      this.contractId = response.id;
      this.isLoading = false;
      this.notification.success("Thành công", "Lưu hợp đồng thành công!", { nzDuration: 2000 });
      this.router.navigate(['projects', this.project.id, 'contracts']);
    });
  }

  saveAndSend() {
    if (!this.contractForm.valid) {
      return;
    }
    this.isLoading = true;
    this.createOrUpdateContract()
      .subscribe(response => {
        this.notification.success("Thành công", "Lưu hợp đồng thành công!", { nzDuration: 2000 });
        this.contractId = response.id;
        this.contractService
          .sendContract(this.contractId!, this.project.id)
          .pipe(
            catchError(error => {
              this.isLoading = false;
              this.notification.error("Lỗi", "Gửi thỏa thuận thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.isLoading = false;
            this.notification.success("Thành công", "Gửi hợp đồng thành công!", { nzDuration: 2000 });
            this.router.navigate(['projects', this.project.id, 'contracts']);
          })
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
        this.isLoading = false;
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
      },
      investorInfo: {
        userId: this.investorId,
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
      },
      disbursements: this.disbursements
    };
  }

  showPreview() {
    this.isLoading = true;
    this.createOrUpdateContract().subscribe((response) => {
      this.contractId = response.id;
      this.notification.success('Thành công', 'Lưu hợp đồng thành công!', { nzDuration: 2000 });
      this.isLoading = false;
      this.download();
    });
  }

  download() {
    this.isLoading = true;
    this.contractService
      .downloadContract(this.contractId!, this.project.id)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Tải hợp đồng thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(response => {
        this.isLoading = false;
        window.open(response.downLoadUrl, '_blank');
      });
  }

  cancelSign() {
    this.modalService.confirm({
      nzTitle: 'Từ chối ký hợp đồng',
      nzContent: `Từ chối ký ${this.contract?.contractName}?`,
      nzOkText: 'Từ chối',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.contractService.cancelSign(this.project.id, this.contract!.id)
          .pipe(
            catchError(error => {
              this.isLoading = false;
              this.notification.error("Lỗi", "Từ chối ký hợp đồng thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.isLoading = false;
            this.notification.success("Thành công", "Từ chối ký hợp đồng thành công!", { nzDuration: 2000 });
            this.contract!.contractStatus = ContractStatus.DECLINED;
          });
      }
    });
  }

  openTerminateModal() {
    if (this.isLeader) {
      this.modalService.create({
        nzTitle: 'Kết thúc hợp đồng',
        nzContent: TerminateMeetingModalComponent,
        nzData: { projectId: this.project.id, contractId: this.contract!.id, isFromLeader: true },
        nzFooter: null,
        nzStyle: { top: '40px' },
      }).afterClose.subscribe(result => {
        if (result) this.navigateBack();
      });
    } else {
      this.modalService.create({
        nzTitle: 'Kết thúc hợp đồng',
        nzContent: TerminateContractModalComponent,
        nzData: { projectId: this.project.id, contractId: this.contract!.id },
        nzFooter: null,
      }).afterClose.subscribe(result => {
        if (result) this.navigateBack();
      });
    }
  }

  openLiquidationModal() {
    if (this.contract?.liquidationNoteId) {
      this.router.navigate([
        '/projects',
        this.project.id,
        'liquidation-contract',
        this.contract.liquidationNoteId
      ]);
      return;
    }

    this.modalService.create({
      nzTitle: 'Thanh lý hợp đồng',
      nzContent: LiquidationModalComponent,
      nzData: { projectId: this.project.id, contractId: this.contract!.id },
      nzFooter: null,
    }).afterClose.subscribe(result => {
      if (result) this.navigateBack();
    });
  }

  checkLiquidation() {
    const meetingStatus = this.contract?.appointments.pop()?.status;
    return this.contract?.contractStatus === ContractStatus.WAITING_FOR_LIQUIDATION
      && this.isLeader
      && meetingStatus === MeetingStatus.FINISHED;
  }

  navigateBack() {
    this.location.back();
  }
}
