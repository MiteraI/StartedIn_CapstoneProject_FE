import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DisbursementCreateModel } from 'src/app/shared/models/disbursement/disbursement-create.model';
import { CreateDisbursementFormComponent } from '../create-disbursement-form/create-disbursement-form.component';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IonicModule } from '@ionic/angular';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { InvestmentContractCreateModel } from 'src/app/shared/models/contract/investment-contract-create.model';
import { ProjectModel } from 'src/app/shared/models/project/project.model';
import { ClickOutsideDirective } from 'src/app/shared/directives/click-outside.directive';

@Component({
  selector: 'app-create-investment-contract-form',
  templateUrl: './create-investment-contract-form.component.html',
  styleUrls: ['./create-investment-contract-form.component.scss'],
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
    ClickOutsideDirective
  ]
})
export class CreateInvestmentContractFormComponent implements OnInit {
  @Input({required: true}) projectId!: string;
  @Input({required: true}) investorId!: string;
  project: ProjectModel = {
    id: "1",
    projectName: "name",
    description: "desc",
    projectStatus: "status",
    logoUrl: "logourl",
    totalShares: 1000,
    remainingPercentOfShares: 50,
    remainingShares: 500,
    startDate: "2024-10-30", // Date?
    endDate: "2024-10-31"
  }
  contractForm!: FormGroup;
  vndFormatter = (value: number) => value.toLocaleString() + '₫';
  vndParser = (value: string) => value.replace(/\D/g,''); // remove all non-digits
  disbursements: DisbursementCreateModel[] = [];
  disbursementTotalAmount: number = 0;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService
  ) {}

  ngOnInit() {
    this.contractForm = this.fb.group({
      contractName: ['', [Validators.required]],
      contractPolicy: [''],
      contractIdNumber: ['', [Validators.required]],
      shareQuantity: [0, [Validators.required]],
      percentage: [0, [Validators.required]],
      buyPrice: [0, [Validators.required, Validators.min(this.disbursementTotalAmount)]]
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

  onSubmit() {
    if (this.contractForm.valid) {
      const contract: InvestmentContractCreateModel = {
        contract: {
          ...this.contractForm.value,
          projectId: this.projectId
        },
        investorInfo: {
          ...this.contractForm.value,
          userId: this.investorId
        },
        disbursements: this.disbursements
      };
      console.log(contract);
    }
  }
}
