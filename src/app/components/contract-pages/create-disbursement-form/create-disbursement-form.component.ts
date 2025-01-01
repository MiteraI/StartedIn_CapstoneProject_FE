import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { DisbursementCreateModel } from "src/app/shared/models/disbursement/disbursement-create.model";
import { NZ_MODAL_DATA } from "ng-zorro-antd/modal";
import { VndCurrencyPipe } from "src/app/shared/pipes/vnd-currency.pipe";

export interface IModalData {
  disbursement?: DisbursementCreateModel;
  projectStartDate: Date;
  projectEndDate: Date | null;
  totalContractAmount: number;
  totalDisbursedAmount: number;
  currentAmount?: number;
}

@Component({
  selector: 'app-create-disbursement-form',
  templateUrl: './create-disbursement-form.component.html',
  styleUrls: ['./create-disbursement-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzInputNumberModule,
    VndCurrencyPipe
  ]
})
export class CreateDisbursementFormComponent implements OnInit {
  disbursementForm!: FormGroup;
  disbursement!: DisbursementCreateModel;
  vndCurrencyPipe: VndCurrencyPipe = new VndCurrencyPipe();
  remainingAmount: number = 0;

  vndFormatter = (value: number) => (!!value ? this.vndCurrencyPipe.transform(value) : value);
  vndParser = (value: string) => value.replace(/\D/g,'');

  constructor(
    private fb: FormBuilder,
    @Inject(NZ_MODAL_DATA) public data: IModalData
  ) {}

  ngOnInit() {
    this.disbursement = this.data.disbursement!;
    const maxAmount = this.data.totalContractAmount - this.data.totalDisbursedAmount + (this.data.currentAmount || 0);
    this.remainingAmount = maxAmount;

    this.disbursementForm = this.fb.group({
      title: [this.disbursement?.title || '', [Validators.required]],
      startDate: [this.disbursement?.startDate ? new Date(this.disbursement.startDate) : null, [Validators.required]],
      endDate: [this.disbursement?.endDate ? new Date(this.disbursement.endDate) : null, [Validators.required]],
      amount: [
        this.disbursement?.amount || Math.min(100000000, maxAmount),
        [
          Validators.required,
          Validators.min(1000),
          Validators.max(maxAmount)
        ]
      ],
      condition: [this.disbursement?.condition || '', [Validators.required]]
    });

    this.disbursementForm.get('amount')?.valueChanges.subscribe(value => {
      this.remainingAmount = maxAmount - (value || 0);
    });
  }

  disableStartDate = (startDate: Date): boolean => {
    if (this.data.projectStartDate && startDate < this.data.projectStartDate) {
      return true;
    }

    if (this.data.projectEndDate && startDate > this.data.projectEndDate) {
      return true;
    }

    const endDate = this.disbursementForm.get('endDate')?.value;
    return !!endDate && startDate > endDate;
  };

  disableEndDate = (endDate: Date): boolean => {
    if (this.data.projectStartDate && endDate < this.data.projectStartDate) {
      return true;
    }

    if (this.data.projectEndDate && endDate > this.data.projectEndDate) {
      return true;
    }

    const startDate = this.disbursementForm.get('startDate')?.value;
    return !!startDate && endDate < startDate;
  };
}
