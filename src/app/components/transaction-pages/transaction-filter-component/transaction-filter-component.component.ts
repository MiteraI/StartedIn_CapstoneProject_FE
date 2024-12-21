import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { MenuStateService } from 'src/app/core/util/menu-state.service';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { TransactionType, TransactionTypeLabels } from 'src/app/shared/enums/transaction-type.enum';

@Component({
  selector: 'app-transaction-filter',
  templateUrl: './transaction-filter-component.component.html',
  styleUrls: ['./transaction-filter-component.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzInputNumberModule
  ]
})
export class TransactionFilterComponent implements OnInit {
  @Input() data: any;
  @Input() isDisbursementHistory: boolean = false;
  @Output() filterApplied = new EventEmitter<any>();

  filterForm!: FormGroup;

  transactionTypeOptions = Object.values(TransactionType)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as TransactionType,
      label: TransactionTypeLabels[value as TransactionType]
    }));

  vndCurrencyPipe: VndCurrencyPipe = new VndCurrencyPipe();
  vndFormatter = (value: number) => (!!value ? this.vndCurrencyPipe.transform(value) : value);
  vndParser = (value: string) => value.replace(/\D/g,'');

  constructor(
    private fb: FormBuilder,
    private menuState: MenuStateService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      fromName: [this.data.fromName || ''],
      toName: [this.data.toName || ''],
      dateRange: [this.data.dateRange || []],
      amountFrom: [this.data.amountFrom || null],
      amountTo: [this.data.amountTo || null],
      isInFlow: [this.data.isInFlow || null]
    });
  }

  resetFilters() {
    this.filterForm.reset({
      fromName: '',
      toName: '',
      dateRange: [],
      amountFrom: null,
      amountTo: null,
      isInFlow: null
    });
    this.filterApplied.emit({
      ...this.filterForm.value,
      dateFrom: null,
      dateTo: null
    });
    this.menuState.closeMenu();
  }

  applyFilters() {
    const dateRange = this.filterForm.get('dateRange')?.value || [];

    this.filterApplied.emit({
      ...this.filterForm.value,
      dateFrom: dateRange[0],
      dateTo: dateRange[1]
    });
    this.menuState.closeMenu();
  }

  updateForm(filterData: any) {
    const dateRange = (filterData.dateFrom || filterData.dateTo)
      ? [filterData.dateFrom || null, filterData.dateTo || null]
      : null;
    if (this.filterForm) {
      this.filterForm.patchValue({
        fromName: filterData.fromName || '',
        toName: filterData.toName || '',
        dateRange: dateRange,
        amountFrom: filterData.amountFrom || null,
        amountTo: filterData.amountTo || null,
        isInFlow: filterData.isInFlow || null
      });
    }
  }

  validateAmountRange(): void {
    const amountFrom = this.filterForm.get('amountFrom')?.value;
    const amountTo = this.filterForm.get('amountTo')?.value;

    if (amountFrom && amountTo && amountFrom > amountTo) {
      this.filterForm.get('amountFrom')?.setErrors({ invalidRange: true });
      this.filterForm.get('amountTo')?.setErrors({ invalidRange: true });
    } else {
      if (this.filterForm.get('amountFrom')?.errors?.['invalidRange']) {
        const amountFromErrors = { ...this.filterForm.get('amountFrom')?.errors };
        delete amountFromErrors['invalidRange'];
        this.filterForm.get('amountFrom')?.setErrors(Object.keys(amountFromErrors).length ? amountFromErrors : null);
      }
      if (this.filterForm.get('amountTo')?.errors?.['invalidRange']) {
        const amountToErrors = { ...this.filterForm.get('amountTo')?.errors };
        delete amountToErrors['invalidRange'];
        this.filterForm.get('amountTo')?.setErrors(Object.keys(amountToErrors).length ? amountToErrors : null);
      }
    }
  }
}
