import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ProjectStatus, ProjectStatusLabels } from 'src/app/shared/enums/project-status.enum';
import { MenuStateService } from 'src/app/core/util/menu-state.service';

@Component({
  selector: 'app-project-filter',
  templateUrl: './project-filter.component.html',
  styleUrls: ['./project-filter.component.scss'],
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
export class ProjectFilterComponent implements OnInit {
  @Input() data: any;
  @Output() filterApplied = new EventEmitter<any>();

  filterForm!: FormGroup;

  statusOptions = Object.values(ProjectStatus)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as ProjectStatus,
      label: ProjectStatusLabels[value as ProjectStatus]
    }));

  constructor(
    private fb: FormBuilder,
    private menuState: MenuStateService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      projectName: [this.data.projectName || ''],
      description: [this.data.description || ''],
      leaderFullName: [this.data.leaderFullName || ''],
      projectStatus: [this.data.projectStatus || '']
    });
  }

  resetFilters() {
    this.filterForm.reset({
      projectName: '',
      description: '',
      leaderFullName: '',
      projectStatus: ''
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
        description: filterData.description || '',
        leaderFullName: filterData.leaderFullName || '',
        projectStatus: filterData.projectStatus || ''
      });
    }
  }
}
