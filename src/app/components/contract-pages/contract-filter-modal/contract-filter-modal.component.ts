import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContractType, ContractTypeLabels } from 'src/app/shared/enums/contract-type.enum';
import { ContractStatus, ContractStatusLabels } from 'src/app/shared/enums/contract-status.enum';
import { CommonModule } from '@angular/common';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
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
import { ProjectService } from 'src/app/services/project.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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

  users: ContractPartyModel[] = [];
  filteredUsers: ContractPartyModel[] = [];
  selectedPartyId: string | null = null;

  constructor(
    private projectService: ProjectService,
    private modal: NzModalRef,
    private fb: FormBuilder,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {}

  ngOnInit() {
    this.projectService
      .getContractPartiesForProject(this.data.id)
      .pipe(
        catchError(error => {
          //TODO noti stuff
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => this.users = result);
    this.filterForm = this.fb.group({
      contractName: [this.data.contractName || ''],
      contractType: [this.data.contractType || ''],
      parties: [this.data.parties || []],
      dateRange: [this.data.dateRange || []],
      contractStatus: [this.data.status || '']
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
      contractStatus: ''
    });
  }

  applyFilters() {
    this.modal.close({
      ...this.filterForm.value,
      lastUpdatedStartDate: this.filterForm.get('dateRange')?.value[0],
      lastUpdatedEndDate: this.filterForm.get('dateRange')?.value[1],
    });
  }

  dismiss() {
    this.modal.close();
  }
}
