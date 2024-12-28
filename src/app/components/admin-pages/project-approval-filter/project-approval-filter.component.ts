import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { MenuStateService } from 'src/app/core/util/menu-state.service'
import { ProjectApprovalStatus, ProjectApprovalStatusLabel } from 'src/app/shared/enums/project-approval-status.enum'

@Component({
  selector: 'app-project-approval-filter',
  templateUrl: './project-approval-filter.component.html',
  styleUrls: ['./project-approval-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, NzDatePickerModule, FormsModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzSelectModule, NzButtonModule],
})
export class ProjectApprovalFilterComponent implements OnInit {
  @Input() data: any
  @Output() filterApplied = new EventEmitter<any>()

  filterForm!: FormGroup

  statusOptions = Object.values(ProjectApprovalStatus)
    .filter((value) => typeof value === 'number')
    .map((value) => ({
      value: value as ProjectApprovalStatus,
      label: ProjectApprovalStatusLabel[value as ProjectApprovalStatus],
    }))

  constructor(private fb: FormBuilder, private menuState: MenuStateService) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      approvalId: [this.data.approvalId || ''],
      dateRange: [this.data.dateRange || []],
      status: [this.data.status || ''],
    })
  }

  resetFilters() {
    this.filterForm.reset({
      approvalId: '',
      dateRange: [],
      status: '',
    })
    this.filterApplied.emit(this.filterForm.value)
    this.menuState.closeMenu()
  }

  applyFilters() {
    const dateRange = this.filterForm.get('dateRange')?.value || []
    this.filterApplied.emit({ ...this.filterForm.value, periodFrom: dateRange[0], periodTo: dateRange[1] })
    this.menuState.closeMenu()
  }

  updateForm(filterData: any) {
    const dateRange = filterData.periodFrom || filterData.periodTo ? [filterData.periodFrom || null, filterData.periodTo || null] : null
    if (this.filterForm) {
      this.filterForm.patchValue({
        approvalId: filterData.approvalId || '',
        dateRange: dateRange || [],
        status: filterData.status || '',
      })
    }
  }
}
