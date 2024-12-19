import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { catchError, throwError } from 'rxjs';
import { MenuStateService } from 'src/app/core/util/menu-state.service';
import { MilestoneService } from 'src/app/services/milestone.service';
import { ProjectService } from 'src/app/services/project.service';
import { MeetingLabel, MeetingStatus } from 'src/app/shared/enums/meeting-status.enum';
import { Milestone } from 'src/app/shared/models/milestone/milestone.model';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';

@Component({
  selector: 'app-meeting-filter',
  templateUrl: './meeting-filter.component.html',
  styleUrls: ['./meeting-filter.component.scss'],
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
export class MeetingFilterComponent  implements OnInit {

  @Input() data: any;
  @Output() filterApplied = new EventEmitter<any>();
  
  filterForm!: FormGroup;
  meetingStatusOptions = Object.values(MeetingStatus)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as MeetingStatus,
      label: MeetingLabel[value as MeetingStatus]
    }));
  
  milestones: Milestone[] = [];
  milestonePage = 1;
  milestoneSize = 10;
  milestoneTotal = 0;
  isMilestoneLoading = false;

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder,
    private menuState: MenuStateService,
    private notification: NzNotificationService,
    private milestoneService: MilestoneService,
  ) {}

  ngOnInit() {
    this.loadMilestones();
    console.log(this.data.projectId)
    this.filterForm = this.fb.group({
      milestoneId: [this.data.milestoneId || null],
      title: [this.data.tile || ''],
      dateRange: [this.data.dateRange || []],
      meetingStatus: [this.data.meetingStatus || ''],
      isDescending: [this.data.isDescending || null]
    });
  }

  private loadMilestones() {
      if (this.isMilestoneLoading) return;
  
      this.isMilestoneLoading = true;
      this.milestoneService
        .getMilestones(this.data.projectId, this.milestonePage, this.milestoneSize)
        .pipe(
          catchError(error => {
            this.notification.error("Lỗi", "Lấy danh sách cột mốc thất bại!", { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(result => {
          this.milestones = [...this.milestones, ...result.data];
          this.milestoneTotal = result.total;
          this.isMilestoneLoading = false;
        });
  }

  onMilestoneScroll() {
    if (this.isMilestoneLoading) return;
    if (this.milestonePage * this.milestoneSize >= this.milestoneTotal) return;

    this.milestonePage++;
    this.loadMilestones();
  }

  nzFilterOption = () => true;
  resetFilters(){
    this.filterForm.reset({
      milestoneId: null,
      title: '',
      dateRange: [],
      meetingStatus: '',
      isDescending: null
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
      toDate: dateRange[1],
    });
    this.menuState.closeMenu();
  }

  updateForm(filterData: any) {
    const dateRange = (filterData.fromDate || filterData.toDate)
    ? [filterData.startDate || null, filterData.endDate || null]
    : null;
    if (this.filterForm) {
      this.filterForm.patchValue({
        dateRange: dateRange || [],
        milestoneId: filterData.milestoneId || null,
        title: filterData.title || '',
        meetingStatus: filterData.meetingStatus || '',
        isDescending: filterData.isDescending || null
      });
    }
  }
  toggleDescending(value: boolean): void {
    this.filterForm.patchValue({ isDescending: value });
  }



}
