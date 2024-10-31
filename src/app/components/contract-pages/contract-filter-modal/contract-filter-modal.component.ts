import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';

interface FilterOptions {
  contractName: string;
  contractType: string;
  parties: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: 'all' | 'completed' | 'pending';
}

@Component({
  selector: 'app-contract-filter-modal',
  templateUrl: './contract-filter-modal.component.html',
  styleUrls: ['./contract-filter-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzRadioModule,
    NzButtonModule,
    NzIconModule
  ]
})
export class ContractFilterModalComponent implements OnInit {
  filterForm: FormGroup;
  contractTypes = ['Stock Purchase', 'Service Agreement', 'Employment', 'NDA', 'Other'];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      contractName: [''],
      contractType: [''],
      parties: this.fb.array([this.fb.control('')]),
      dateRange: [[]],
      status: ['all']
    });
  }

  ngOnInit() {}

  get partiesFormArray() {
    return this.filterForm.get('parties') as FormArray;
  }

  addParty() {
    this.partiesFormArray.push(this.fb.control(''));
  }

  removeParty(index: number) {
    this.partiesFormArray.removeAt(index);
  }

  resetFilters() {
    this.filterForm.reset({
      contractName: '',
      contractType: '',
      parties: [''],
      dateRange: [],
      status: 'all'
    });

    // Reset parties array to single empty input
    while (this.partiesFormArray.length > 1) {
      this.partiesFormArray.removeAt(1);
    }
  }

  applyFilters() {
    const formValue = this.filterForm.value;

    // Clean up empty parties
    const parties = formValue.parties.filter((party: string) => party.trim());

    const dateRange = formValue.dateRange || [null, null];

    const filters: FilterOptions = {
      contractName: formValue.contractName,
      contractType: formValue.contractType,
      parties: parties,
      dateRange: {
        start: dateRange[0],
        end: dateRange[1]
      },
      status: formValue.status
    };

    this.modal.close(filters);
  }

  dismiss() {
    this.modal.close();
  }
}
