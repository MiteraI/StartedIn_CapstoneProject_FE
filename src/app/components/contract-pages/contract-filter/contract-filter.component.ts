import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContractType, ContractTypeLabels } from 'src/app/shared/enums/contract-type.enum';
import { ContractStatus, ContractStatusLabels } from 'src/app/shared/enums/contract-status.enum';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { ContractPartyModel } from 'src/app/shared/models/contract/contract-party.model';
import { ProjectService } from 'src/app/services/project.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MenuStateService } from 'src/app/services/menu-state.service';

@Component({
  selector: 'app-contract-filter',
  templateUrl: './contract-filter.component.html',
  styleUrls: ['./contract-filter.component.scss'],
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
    InitialsOnlyPipe
  ]
})
export class ContractFilterComponent implements OnInit {
  @Input() data: any;
  @Output() filterApplied = new EventEmitter<any>();

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
    private fb: FormBuilder,
    private menuState: MenuStateService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.projectService
      .getContractPartiesForProject(this.data.id)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách bên liên quan thất bại!", { nzDuration: 2000 });
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
    this.filterApplied.emit({
      ...this.filterForm.value,
      lastUpdatedStartDate: this.filterForm.get('dateRange')?.value[0],
      lastUpdatedEndDate: this.filterForm.get('dateRange')?.value[1],
    });
    this.menuState.closeMenu();
  }

  applyFilters() {
    this.filterApplied.emit({
      ...this.filterForm.value,
      lastUpdatedStartDate: this.filterForm.get('dateRange')?.value[0],
      lastUpdatedEndDate: this.filterForm.get('dateRange')?.value[1],
    });
    this.menuState.closeMenu();
  }

  updateForm(filterData: any) {
    if (this.filterForm) {
      this.filterForm.patchValue({
        contractName: filterData.contractName || '',
        contractType: filterData.contractType || '',
        parties: filterData.parties || [],
        dateRange: [filterData.lastUpdatedStartDate, filterData.lastUpdatedEndDate] || [],
        contractStatus: filterData.contractStatus || ''
      });
    }
  }
}
