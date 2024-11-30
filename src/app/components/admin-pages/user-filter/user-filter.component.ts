import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { MenuStateService } from 'src/app/core/util/menu-state.service';

@Component({
  selector: 'app-user-filter',
  templateUrl: './user-filter.component.html',
  styleUrls: ['./user-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule
  ]
})
export class UserFilterComponent implements OnInit {
  @Input() data: any;
  @Output() filterApplied = new EventEmitter<any>();

  filterForm!: FormGroup;

  roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'User', label: 'User' },
    { value: 'Investor', label: 'Nhà đầu tư' },
    { value: 'Mentor', label: 'Cố vấn' }
  ];

  constructor(
    private fb: FormBuilder,
    private menuState: MenuStateService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      fullName: [this.data.fullName || ''],
      email: [this.data.email || ''],
      phoneNumber: [this.data.phoneNumber || ''],
      authorities: [this.data.authorities || ''],
      isActive: [this.data.isActive ?? '']
    });
  }

  resetFilters() {
    this.filterForm.reset({
      fullName: '',
      email: '',
      phoneNumber: '',
      authorities: '',
      isActive: ''
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
        fullName: filterData.fullName || '',
        email: filterData.email || '',
        phoneNumber: filterData.phoneNumber || '',
        authorities: filterData.authorities || '',
        isActive: filterData.isActive ?? ''
      });
    }
  }
}
