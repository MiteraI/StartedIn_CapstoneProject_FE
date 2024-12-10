import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectService } from 'src/app/services/project.service';
import { catchError, throwError } from 'rxjs';
import { DisbursementStatus, DisbursementStatusLabels } from 'src/app/shared/enums/disbursement-status.enum';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { MenuStateService } from 'src/app/core/util/menu-state.service';
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { ProjectModel } from 'src/app/shared/models/project/project.model';

@Component({
  selector: 'app-disbursement-filter',
  templateUrl: './disbursement-filter.component.html',
  styleUrls: ['./disbursement-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzAvatarModule,
    NzInputNumberModule
  ]
})
export class DisbursementFilterComponent implements OnInit {
  @Input() data: any;
  @Input() showInvestorSelect: boolean = true;
  @Input() showProjectSelect: boolean = true;
  @Output() filterApplied = new EventEmitter<any>();

  filterForm!: FormGroup;

  disbursementStatusOptions = Object.values(DisbursementStatus)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as DisbursementStatus,
      label: DisbursementStatusLabels[value as DisbursementStatus]
    }));

  investors: TeamMemberModel[] = [];
  filteredInvestors: TeamMemberModel[] = [];
  projects: ProjectModel[] = [];
  filteredProjects: ProjectModel[] = [];

  vndCurrencyPipe: VndCurrencyPipe = new VndCurrencyPipe();
  vndFormatter = (value: number) => (!!value ? this.vndCurrencyPipe.transform(value) : value);
  vndParser = (value: string) => value.replace(/\D/g,''); // remove all non-digits

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder,
    private menuState: MenuStateService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    if (this.showInvestorSelect && this.data.projectId) {
      this.loadInvestors();
    }

    if (this.showProjectSelect) {
      this.loadProjects();
    }

    this.filterForm = this.fb.group({
      name: [this.data.name || ''],
      investorId: [this.data.investorId || ''],
      projectId: [this.data.projectId || ''],
      dateRange: [this.data.dateRange || []],
      amountFrom: [this.data.amountFrom || null],
      amountTo: [this.data.amountTo || null],
      status: [this.data.status || ''],
      contractIdNumber: [this.data.contractIdNumber || ''],
    });
  }

  private loadInvestors() {
    this.projectService
      .getMembers(this.data.projectId)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách nhà đầu tư thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(members => {
        this.investors = members.filter(m => m.roleInTeam === TeamRole.INVESTOR);
        this.filteredInvestors = [...this.investors];
      });
  }

  private loadProjects() {
    this.projectService
      .getUserProjects()
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách dự án thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.projects = result.listParticipatedProject;
        this.filteredProjects = [...this.projects];
      });
  }

  nzFilterOption = () => true;

  onInvestorSearch(searchText: string): void {
    const search = searchText.toLowerCase();
    this.filteredInvestors = this.investors.filter(investor =>
      investor.fullName.toLowerCase().includes(search) ||
      investor.email.toLowerCase().includes(search)
    );
  }

  onProjectSearch(searchText: string): void {
    const search = searchText.toLowerCase();
    this.filteredProjects = this.projects.filter(project =>
      project.projectName.toLowerCase().includes(search)
    );
  }

  resetFilters() {
    this.filterForm.reset({
      name: '',
      investorId: '',
      projectId: '',
      dateRange: [],
      amountFrom: null,
      amountTo: null,
      status: '',
      contractIdNumber: ''
    });
    this.filterApplied.emit({
      ...this.filterForm.value,
      periodFrom: null,
      periodTo: null
    });
    this.menuState.closeMenu();
  }

  applyFilters() {
    const dateRange = this.filterForm.get('dateRange')?.value || [];

    this.filterApplied.emit({
      ...this.filterForm.value,
      periodFrom: dateRange[0],
      periodTo: dateRange[1]
    });
    this.menuState.closeMenu();
  }

  updateForm(filterData: any) {
    const dateRange = (filterData.periodFrom || filterData.periodTo)
      ? [filterData.periodFrom || null, filterData.periodTo || null]
      : null;
    if (this.filterForm) {
      this.filterForm.patchValue({
        name: filterData.name || '',
        investorId: filterData.investorId || '',
        projectId: filterData.projectId || '',
        dateRange: dateRange,
        amountFrom: filterData.amountFrom || null,
        amountTo: filterData.amountTo || null,
        status: filterData.status || '',
        contractIdNumber: filterData.contractIdNumber || ''
      });
    }
  }

  validateAmountRange(): void {
    const amountFrom = this.filterForm.get('amountFrom')?.value;
    const amountTo = this.filterForm.get('amountTo')?.value;

    if (amountFrom && amountTo && amountFrom > amountTo) {
      this.filterForm.get('amountFrom')?.setErrors({ invalidRange: true });
      this.filterForm.get('amountTo')?.setErrors({ invalidRange: true });
    } else {
      // Clear the error if it exists and there are no other errors
      if (this.filterForm.get('amountFrom')?.errors?.['invalidRange']) {
        const amountFromErrors = { ...this.filterForm.get('amountFrom')?.errors };
        delete amountFromErrors['invalidRange'];
        this.filterForm.get('amountFrom')?.setErrors(Object.keys(amountFromErrors).length ? amountFromErrors : null);
      }
      if (this.filterForm.get('amountTo')?.errors?.['invalidRange']) {
        const amountToErrors = { ...this.filterForm.get('amountTo')?.errors };
        delete amountToErrors['invalidRange'];
        this.filterForm.get('amountTo')?.setErrors(Object.keys(amountToErrors).length ? amountToErrors : null);
      }
    }
  }
}
