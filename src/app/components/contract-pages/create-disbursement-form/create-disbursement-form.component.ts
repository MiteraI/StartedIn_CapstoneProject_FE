import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { DisbursementCreateModel } from "src/app/shared/models/disbursement/disbursement-create.model";
import { NZ_MODAL_DATA } from "ng-zorro-antd/modal";

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
    NzInputNumberModule
  ]
})
export class CreateDisbursementFormComponent implements OnInit {
  disbursementForm!: FormGroup;
  disbursement!: DisbursementCreateModel;

  constructor(
    private fb: FormBuilder,
    @Inject(NZ_MODAL_DATA) public data: DisbursementCreateModel
  ) {}

  ngOnInit() {
    this.disbursement = {
      ...this.data
    };
    this.disbursementForm = this.fb.group({
      title: [this.disbursement?.title || '', [Validators.required]],
      startDate: [this.disbursement?.startDate ? new Date(this.disbursement.startDate) : null, [Validators.required]],
      endDate: [this.disbursement?.endDate ? new Date(this.disbursement.endDate) : null, [Validators.required]],
      amount: [this.disbursement?.amount || null, [Validators.required, Validators.min(1)]],
      condition: [this.disbursement?.condition || '', [Validators.required]]
    });
  }

  disableStartDate = (startDate: Date): boolean => {
    const endDate = this.disbursementForm.get('endDate')?.value;
    return !!endDate && startDate > endDate;
  };

  disableEndDate = (endDate: Date): boolean => {
    const startDate = this.disbursementForm.get('startDate')?.value;
    return !!startDate && endDate < startDate;
  };
}
