import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MenuStateService } from 'src/app/core/util/menu-state.service';
import { InvestmentCallService } from 'src/app/services/investment-call.service';
import { InvestmentCallLabel, InvestmentCallStatus } from 'src/app/shared/enums/investment-call-status.enum';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';

@Component({
  selector: 'app-investment-call-filter',
  templateUrl: './investment-call-filter.component.html',
  styleUrls: ['./investment-call-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzRadioModule,
    NzButtonModule,
    NzIconModule,
    NzAvatarModule,
    NzInputNumberModule    
  ]
})
export class InvestmentCallFilterComponent  implements OnInit {
  @Input() data: any;
  @Output() filterApplied = new EventEmitter<any>();

  filterForm!: FormGroup;
  statusOptions = Object.values(InvestmentCallStatus)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as InvestmentCallStatus,
      label: InvestmentCallLabel[value as InvestmentCallStatus]
    }));
    vndCurrencyPipe: VndCurrencyPipe = new VndCurrencyPipe();
    vndFormatter = (value: number) => (!!value ? this.vndCurrencyPipe.transform(value) : value);
    vndParser = (value: string) => value.replace(/\D/g,''); // remove all non-digits
  
  constructor (
    private investmentCallService: InvestmentCallService,
    private fb: FormBuilder,
    private menuState: MenuStateService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      dateRange: [this.data.dateRange || []],
      status: [this.data.status || ''],
      fromAmountRaised: [this.data.fromAmountRaised || null],
      toAmountRaised: [this.data.toAmountRaised || null],
      fromEquityShareCall: [this.data.fromEquityShareCall || null],
      toEquityShareCall: [this.data.toEquityShareCall || null],
      fromTargetCall: [this.data.fromTargetCall || null],
      toTargetCall: [this.data.toTargetCall || null]
    });
  }

  nzFilterOption = () => true;
  resetFilters(){
    this.filterForm.reset({
      dateRange: [],
      status: '',
      fromAmountRaised: null,
      toAmountRaised: null,
      fromEquityShareCall: null,
      toEquityShareCall: null,
      fromTargetCall: null,
      toTargetCall: null
    });
    this.filterApplied.emit({
      ...this.filterForm.value,
      startDate: null,
      endDate: null,
      
    });
    this.menuState.closeMenu();
  }

  applyFilters() {
    const dateRange = this.filterForm.get('dateRange')?.value || [];
    this.filterApplied.emit({
      ...this.filterForm.value,
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    this.menuState.closeMenu();
  }

  updateForm(filterData: any) {
      const dateRange = (filterData.startDate || filterData.endDate)
      ? [filterData.startDate || null, filterData.endDate || null]
      : null;
    if (this.filterForm) {
      this.filterForm.patchValue({
        dateRange: dateRange || [],
        status: filterData.status || '',
        fromAmountRaised: filterData.fromAmountRaised || null,
        toAmountRaised: filterData.toAmountRaised || null,
        fromEquityShareCall: filterData.fromEquityShareCall || null,
        toEquityShareCall: filterData.toEquityShareCall || null,
        fromTargetCall: filterData.fromTargetCall || null,
        toTargetCall: filterData.toTargetCall || null
      });
    }
  }

  validateAmountRange(): void {
    this.validateRange('fromAmountRaised', 'toAmountRaised');
    this.validateRange('fromEquityShareCall', 'toEquityShareCall');
    this.validateRange('fromTargetCall', 'toTargetCall');
  }
  
  /**
   * Generic range validation method
   */
  validateRange(fromField: string, toField: string): void {
    const fromValue = this.filterForm.get(fromField)?.value;
    const toValue = this.filterForm.get(toField)?.value;
  
    if (fromValue && toValue && fromValue > toValue) {
      this.filterForm.get(fromField)?.setErrors({ invalidRange: true });
      this.filterForm.get(toField)?.setErrors({ invalidRange: true });
    } else {
      // Clear the error if it exists and there are no other errors
      if (this.filterForm.get(fromField)?.errors?.['invalidRange']) {
        const fromErrors = { ...this.filterForm.get(fromField)?.errors };
        delete fromErrors['invalidRange'];
        this.filterForm.get(fromField)?.setErrors(Object.keys(fromErrors).length ? fromErrors : null);
      }
      if (this.filterForm.get(toField)?.errors?.['invalidRange']) {
        const toErrors = { ...this.filterForm.get(toField)?.errors };
        delete toErrors['invalidRange'];
        this.filterForm.get(toField)?.setErrors(Object.keys(toErrors).length ? toErrors : null);
      }
    }
  }
}
