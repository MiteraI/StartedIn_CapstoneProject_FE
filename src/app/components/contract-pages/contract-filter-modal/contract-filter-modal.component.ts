import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContractType, ContractTypeLabels } from 'src/app/shared/enums/contract-type.enum';
import { ContractStatus, ContractStatusLabels } from 'src/app/shared/enums/contract-status.enum';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { ContractPartyModel } from 'src/app/shared/models/contract/contract-party.model';

interface FilterOptions {
  contractName: string;
  contractType: ContractType;
  parties: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: ContractStatus;
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
    NzIconModule,
    NzAvatarModule,
    InitialsOnlyPipe
  ]
})
export class ContractFilterModalComponent implements OnInit {
  filterForm!: FormGroup;
  contractTypeOptions = Object.values(ContractType)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as ContractType,
      label: ContractTypeLabels[value as ContractType]
    }));
  contractStatusOptions = Object.values(ContractStatus)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as ContractStatus,
      label: ContractStatusLabels[value as ContractStatus]
    }));

  selectedPartyId: string | null = null;

  // Sample user data - replace with your actual user data
  users: ContractPartyModel[] = [
    { id: '1', fullName: 'John Smith', email: 'john.smith@company.com' },
    { id: '2', fullName: 'Sarah Johnson', email: 'sarah.j@company.com' },
    { id: '3', fullName: 'Michael Brown', email: 'm.brown@company.com' },
    { id: '4', fullName: 'Emily Davis', email: 'e.davis@company.com' },
    { id: '5', fullName: 'David Wilson', email: 'd.wilson@company.com' },
    { id: '6', fullName: 'Lisa Anderson', email: 'l.anderson@company.com' }
  ];

  filteredUsers: ContractPartyModel[] = [];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      contractName: [''],
      contractType: [''],
      parties: [[]],
      dateRange: [[]],
      status: ['']
    });
  }

  get selectedUsers(): ContractPartyModel[] {
    const selectedIds = this.filterForm.get('parties')?.value || [];
    return this.users.filter(user => selectedIds.includes(user.id));
  }

  nzFilterOption = () => true;  // Disable default filtering

  onPartySearch(searchText: string): void {
    const search = searchText.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.fullName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  }

  onPartySelect(userId: string): void {
    const currentParties = this.filterForm.get('parties')?.value || [];
    if (!currentParties.includes(userId)) {
      this.filterForm.patchValue({
        parties: [...currentParties, userId]
      });
    }
    this.selectedPartyId = null;  // Reset selection
  }

  removeParty(userId: string): void {
    const currentParties = this.filterForm.get('parties')?.value || [];
    this.filterForm.patchValue({
      parties: currentParties.filter((id: string) => id !== userId)
    });
  }

  resetFilters() {
    this.filterForm.reset({
      contractName: '',
      contractType: '',
      parties: [],
      dateRange: [],
      status: ''
    });
  }

  applyFilters() {
    // const formValue = this.filterForm.value;

    // // Clean up empty parties
    // const parties = formValue.parties.filter((party: string) => party.trim());

    // const dateRange = formValue.dateRange || [null, null];

    // const filters: FilterOptions = {
    //   contractName: formValue.contractName,
    //   contractType: formValue.contractType,
    //   parties: parties,
    //   dateRange: {
    //     start: dateRange[0],
    //     end: dateRange[1]
    //   },
    //   status: formValue.status
    // };

    // this.modal.close(filters);
  }

  dismiss() {
    this.modal.close();
  }
}
