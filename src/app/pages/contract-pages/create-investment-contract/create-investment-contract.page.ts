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
import { IonicModule } from '@ionic/angular';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { InvestmentContractCreateUpdateModel } from 'src/app/shared/models/contract/investment-contract-create-update.model';
import { ProjectModel } from 'src/app/shared/models/project/project.model';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { CreateDisbursementFormComponent } from 'src/app/components/contract-pages/create-disbursement-form/create-disbursement-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ContractService } from 'src/app/services/contract.service';
import { catchError, Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-create-investment-contract',
  templateUrl: './create-investment-contract.page.html',
  styleUrls: ['./create-investment-contract.page.scss'],
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
    IonicModule
  ]
})
export class CreateInvestmentContractPage implements OnInit {
  project!: ProjectModel;
  investorId!: string;

  contractForm!: FormGroup;
  contractId: string | null = null;

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
    private contractService: ContractService
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

    this.route.data.subscribe(data => {
      this.project = data['project'];
    });

    this.route.queryParamMap.subscribe(value => {
      if (!value.get('investorId')) {
        this.location.back(); // navigate back
      }
      this.investorId = value.get('investorId')!;
      const percentage = parseInt(value.get('equityShare') ?? '0');
      const shareQuantity = Math.round(this.project.totalShares * percentage / 100);
      const buyPrice = parseInt(value.get('buyPrice') ?? '0');
      this.contractForm.patchValue({
        shareQuantity: shareQuantity,
        percentage: percentage,
        buyPrice: buyPrice
      })
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
              //TODO noti stuff
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(response => this.router.navigate(['projects', this.project.id, 'contracts']))
      })
  }

  createOrUpdateContract(): Observable<any> {
    var o: Observable<any>;
    if (!this.contractId) {
      o = this.contractService
        .createInvestmentContract(this.project.id, this.contractModel)
    } else {
      o = this.contractService
        .updateInvestmentContract(this.contractId, this.project.id, this.contractModel)
    }
    return o.pipe(
      catchError(error => {
        //TODO noti stuff
        return throwError(() => new Error(error.error));
      })
    );
  }

  get contractModel(): InvestmentContractCreateUpdateModel {
    return {
      contract: {
        contractName: this.contractForm.value.contractName.length || 'Hợp đồng chưa có tên',
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

  showPreview() {
    alert('not implemented');
  }
}
