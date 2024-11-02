import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'
import { ContractType, ContractTypeLabels } from 'src/app/shared/enums/contract-type.enum';
import { ContractPartyModel } from 'src/app/shared/models/contract/contract-party.model';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';

@Component({
  selector: 'app-new-contract-modal',
  templateUrl: 'new-contract-modal.component.html',
  styleUrls: ['new-contract-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzRadioModule,
    NzSelectModule,
    NzButtonModule,
    NzInputModule,
    NzAvatarModule,
    NzIconModule,
    InitialsOnlyPipe
  ]
})
export class NewContractModalComponent implements OnInit {
  contractForm!: FormGroup;
  contractTypeOptions = Object.values(ContractType)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as ContractType,
      label: ContractTypeLabels[value as ContractType]
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
    private fb: FormBuilder,
    private modal: NzModalRef
  ) {}

  ngOnInit() {
    this.contractForm = this.fb.group({
      contractType: [ContractType.INVESTMENT, Validators.required],
      parties: [[], Validators.required]
    });

    // Subscribe to contract type changes
    this.contractForm.get('contractType')?.valueChanges.subscribe(type => {
      if (type === ContractType.INVESTMENT) {
        const currentParties = this.contractForm.get('parties')?.value || [];
        this.contractForm.patchValue({parties: currentParties.slice(0, 1)});
      }
    });
  }

  get selectedUsers(): ContractPartyModel[] {
    const selectedIds = this.contractForm.get('parties')?.value || [];
    return this.users.filter(user => selectedIds.includes(user.id));
  }

  get isInvestment(): boolean {
    return this.contractForm.get('contractType')?.value === ContractType.INVESTMENT;
  }

  nzFilterOption = () => true;  // Disable default filtering

  onPartySearch(searchText: string): void {
    // TODO replace with server search
    const search = searchText.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.fullName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  }

  onPartySelect(userId: string): void {
    const currentParties = this.contractForm.get('parties')?.value || [];
    if (!currentParties.includes(userId)) {
      this.contractForm.patchValue({
        parties: this.isInvestment ? [userId] : [...currentParties, userId]
      });
    }
    this.selectedPartyId = null;  // Reset selection
  }

  removeParty(userId: string): void {
    const currentParties = this.contractForm.get('parties')?.value || [];
    if (currentParties.length <= 1) {
      return;
    }
    this.contractForm.patchValue({
      parties: currentParties.filter((id: string) => id !== userId)
    });
  }

  onSubmit() {
    if (this.contractForm.valid) {
      this.modal.close(this.contractForm.value);
    }
  }

  dismiss() {
    this.modal.close();
  }
}
