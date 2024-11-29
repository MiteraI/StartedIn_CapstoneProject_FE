import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { NzRadioModule } from "ng-zorro-antd/radio";
import { NzSelectModule } from "ng-zorro-antd/select";
import { MenuStateService } from "src/app/core/util/menu-state.service";
import { AssetService } from "src/app/services/asset.service";
import { AssetStatus, AssetStatusLabels } from "src/app/shared/enums/asset-status.enum";
import { InitialsOnlyPipe } from "src/app/shared/pipes/initials-only.pipe";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { VndCurrencyPipe } from "src/app/shared/pipes/vnd-currency.pipe";

@Component({
  selector: 'app-asset-filter',
  templateUrl: './asset-filter.component.html',
  styleUrls: ['./asset-filter.component.scss'],
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
export class AssetFilterComponent implements OnInit {
  @Input() data: any;
  @Output() filterApplied = new EventEmitter<any>();

  filterForm!: FormGroup;
  statusOptions = Object.values(AssetStatus)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as AssetStatus,
      label: AssetStatusLabels[value as AssetStatus]
    }));
  vndCurrencyPipe: VndCurrencyPipe = new VndCurrencyPipe();
  vndFormatter = (value: number) => (!!value ? this.vndCurrencyPipe.transform(value) : value);
  vndParser = (value: string) => value.replace(/\D/g,''); // remove all non-digits
  constructor(
    private assetService: AssetService,
    private fb: FormBuilder,
    private menuState: MenuStateService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      assetName: [this.data.assetName || ''],
      status: [this.data.assetStatus || ''],
      fromPrice: [this.data.fromPrice || null],
      toPrice: [this.data.toPrice || null],
      dateRange: [this.data.dateRange || []],
      serialNumber: [this.data.serialNumber || '']
    });
  }

  nzFilterOption = () => true;  // Disable default filtering

  resetFilters() {
    this.filterForm.reset({
      assetName: '',
      assetStatus: '',
      fromPrice: null,
      toPrice: null,
      dateRange: [],
      serialNumber: ''
    });
    this.filterApplied.emit({
      ...this.filterForm.value,
      fromDate: null,
      toDate: null,
    });
    this.menuState.closeMenu();
  }

  applyFilters() {
    const dateRange = this.filterForm.get('dateRange')?.value || [];

    this.filterApplied.emit({
      ...this.filterForm.value,
      fromDate: dateRange[0],
      toDate: dateRange[1]
    });
    this.menuState.closeMenu();
  }

  updateForm(filterData: any) {
    const dateRange = (filterData.fromDate || filterData.toDate)
      ? [filterData.fromDate || null, filterData.toDate || null]
      : null;
    if (this.filterForm) {
      this.filterForm.patchValue({
        assetName: filterData.assetNameName || '',
        status: filterData.status || '',
        serialNumber: filterData.serialNumber || '',
        dateRange: dateRange,
        fromPrice: filterData.fromPrice || null,
        toPrice: filterData.toPrice || null
      });
    }
  }

  validateAmountRange(): void {
    const fromPrice = this.filterForm.get('fromPrice')?.value;
    const toPrice = this.filterForm.get('toPrice')?.value;

    if (fromPrice && toPrice && fromPrice > toPrice) {
      this.filterForm.get('fromPrice')?.setErrors({ invalidRange: true });
      this.filterForm.get('toPrice')?.setErrors({ invalidRange: true });
    } else {
      // Clear the error if it exists and there are no other errors
      if (this.filterForm.get('fromPrice')?.errors?.['invalidRange']) {
        const fromPriceErrors = { ...this.filterForm.get('fromPrice')?.errors };
        delete fromPriceErrors['invalidRange'];
        this.filterForm.get('fromPrice')?.setErrors(Object.keys(fromPriceErrors).length ? fromPriceErrors : null);
      }
      if (this.filterForm.get('toPrice')?.errors?.['invalidRange']) {
        const toPriceErrors = { ...this.filterForm.get('toPrice')?.errors };
        delete toPriceErrors['invalidRange'];
        this.filterForm.get('toPrice')?.setErrors(Object.keys(toPriceErrors).length ? toPriceErrors : null);
      }
    }
  }
}
