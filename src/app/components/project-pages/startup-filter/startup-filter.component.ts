import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { MenuStateService } from 'src/app/core/util/menu-state.service';
import { InvestmentCallStatus, InvestmentCallLabel } from 'src/app/shared/enums/investment-call-status.enum';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';

@Component({
  selector: 'app-startup-filter',
  templateUrl: './startup-filter.component.html',
  styleUrls: ['./startup-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
    NzButtonModule
  ]
})
export class StartupFilterComponent implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private menuState: MenuStateService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      projectName: [this.data.projectName || ''],
      status: [this.data.status || ''],
      targetFrom: [this.data.targetFrom || null],
      targetTo: [this.data.targetTo || null],
      raisedFrom: [this.data.raisedFrom || null],
      raisedTo: [this.data.raisedTo || null],
      availableShareFrom: [this.data.availableShareFrom || null],
      availableShareTo: [this.data.availableShareTo || null]
    });

    // Subscribe to status changes to handle field disabling
    this.filterForm.get('status')?.valueChanges.subscribe(status => {
      const investmentFields = ['targetFrom', 'targetTo', 'raisedFrom', 'raisedTo', 'availableShareFrom', 'availableShareTo'];

      if (status === InvestmentCallStatus.CLOSED) {
        investmentFields.forEach(field => {
          this.filterForm.get(field)?.disable();
          this.filterForm.get(field)?.setValue(null);
        });
      } else {
        investmentFields.forEach(field => {
          this.filterForm.get(field)?.enable();
        });
      }
    });
  }

  resetFilters() {
    this.filterForm.reset({
      projectName: '',
      status: '',
      targetFrom: null,
      targetTo: null,
      raisedFrom: null,
      raisedTo: null,
      availableShareFrom: null,
      availableShareTo: null
    });
    this.filterApplied.emit(this.filterForm.value);
    this.menuState.closeMenu();
  }

  applyFilters() {
    this.filterApplied.emit(this.filterForm.value);
    this.menuState.closeMenu();
  }

  updateForm(filterData: any) {
    if (this.filterForm) {
      this.filterForm.patchValue({
        projectName: filterData.projectName || '',
        status: filterData.status || '',
        targetFrom: filterData.targetFrom || null,
        targetTo: filterData.targetTo || null,
        raisedFrom: filterData.raisedFrom || null,
        raisedTo: filterData.raisedTo || null,
        availableShareFrom: filterData.availableShareFrom || null,
        availableShareTo: filterData.availableShareTo || null
      });
    }
  }

  validateTargetRange(): void {
    const targetFrom = this.filterForm.get('targetFrom')?.value;
    const targetTo = this.filterForm.get('targetTo')?.value;

    if (targetFrom && targetTo && targetFrom > targetTo) {
      this.filterForm.get('targetFrom')?.setErrors({ invalidRange: true });
      this.filterForm.get('targetTo')?.setErrors({ invalidRange: true });
    } else {
      if (this.filterForm.get('targetFrom')?.errors?.['invalidRange']) {
        const targetFromErrors = { ...this.filterForm.get('targetFrom')?.errors };
        delete targetFromErrors['invalidRange'];
        this.filterForm.get('targetFrom')?.setErrors(Object.keys(targetFromErrors).length ? targetFromErrors : null);
      }
      if (this.filterForm.get('targetTo')?.errors?.['invalidRange']) {
        const targetToErrors = { ...this.filterForm.get('targetTo')?.errors };
        delete targetToErrors['invalidRange'];
        this.filterForm.get('targetTo')?.setErrors(Object.keys(targetToErrors).length ? targetToErrors : null);
      }
    }
  }

  validateRaisedRange(): void {
    const raisedFrom = this.filterForm.get('raisedFrom')?.value;
    const raisedTo = this.filterForm.get('raisedTo')?.value;

    if (raisedFrom && raisedTo && raisedFrom > raisedTo) {
      this.filterForm.get('raisedFrom')?.setErrors({ invalidRange: true });
      this.filterForm.get('raisedTo')?.setErrors({ invalidRange: true });
    } else {
      if (this.filterForm.get('raisedFrom')?.errors?.['invalidRange']) {
        const raisedFromErrors = { ...this.filterForm.get('raisedFrom')?.errors };
        delete raisedFromErrors['invalidRange'];
        this.filterForm.get('raisedFrom')?.setErrors(Object.keys(raisedFromErrors).length ? raisedFromErrors : null);
      }
      if (this.filterForm.get('raisedTo')?.errors?.['invalidRange']) {
        const raisedToErrors = { ...this.filterForm.get('raisedTo')?.errors };
        delete raisedToErrors['invalidRange'];
        this.filterForm.get('raisedTo')?.setErrors(Object.keys(raisedToErrors).length ? raisedToErrors : null);
      }
    }
  }

  validateShareRange(): void {
    const shareFrom = this.filterForm.get('availableShareFrom')?.value;
    const shareTo = this.filterForm.get('availableShareTo')?.value;

    if (shareFrom && shareTo && shareFrom > shareTo) {
      this.filterForm.get('availableShareFrom')?.setErrors({ invalidRange: true });
      this.filterForm.get('availableShareTo')?.setErrors({ invalidRange: true });
    } else {
      if (this.filterForm.get('availableShareFrom')?.errors?.['invalidRange']) {
        const shareFromErrors = { ...this.filterForm.get('availableShareFrom')?.errors };
        delete shareFromErrors['invalidRange'];
        this.filterForm.get('availableShareFrom')?.setErrors(Object.keys(shareFromErrors).length ? shareFromErrors : null);
      }
      if (this.filterForm.get('availableShareTo')?.errors?.['invalidRange']) {
        const shareToErrors = { ...this.filterForm.get('availableShareTo')?.errors };
        delete shareToErrors['invalidRange'];
        this.filterForm.get('availableShareTo')?.setErrors(Object.keys(shareToErrors).length ? shareToErrors : null);
      }
    }
  }
}
