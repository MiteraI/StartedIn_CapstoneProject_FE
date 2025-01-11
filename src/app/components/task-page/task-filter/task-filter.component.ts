import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { ProjectService } from 'src/app/services/project.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { catchError, throwError } from 'rxjs'
import { TaskStatus, TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { MenuStateService } from 'src/app/core/util/menu-state.service'
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { star } from 'ionicons/icons'

@Component({
  selector: 'app-task-filter',
  templateUrl: './task-filter.component.html',
  styleUrls: ['./task-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzSelectModule, NzButtonModule, NzAvatarModule, NzCheckboxModule, NzDatePickerModule],
})
export class TaskFilterComponent implements OnInit {
  @Input() data: any
  @Output() filterApplied = new EventEmitter<any>()

  filterForm!: FormGroup

  taskStatusOptions = Object.values(TaskStatus)
    .filter((value) => typeof value === 'number')
    .map((value) => ({
      value: value as TaskStatus,
      label: TaskStatusLabels[value as TaskStatus],
    }))

  assignees: TeamMemberModel[] = []
  filteredAssignees: TeamMemberModel[] = []

  milestones: Milestone[] = []
  milestonePage = 1
  milestoneSize = 10
  milestoneTotal = 0
  isMilestoneLoading = false

  priorityOrderModes = [
    { value: null, label: 'Không sắp xếp' },
    { value: true, label: 'Ưu tiên cao đến thấp' },
    { value: false, label: 'Ưu tiên thấp đến cao' },
  ]

  isParentTaskModes = [
    { value: null, label: 'Tất cả' },
    { value: true, label: 'Chỉ task mẹ' },
    { value: false, label: 'Chỉ task con' },
  ]

  constructor(
    private projectService: ProjectService,
    private milestoneService: MilestoneService,
    private fb: FormBuilder,
    private menuState: MenuStateService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.loadAssignees()
    this.loadMilestones()

    this.filterForm = this.fb.group({
      title: [this.data.title || ''],
      assigneeId: [this.data.assigneeId || null],
      milestoneId: [this.data.milestoneId || null],
      status: [this.data.status || ''],
      isLate: [this.data.isLate || false],
      priorityOrderMode: [this.data.priorityOrderMode || null],
      startDate: [this.data.startDate || null],
      endDate: [this.data.endDate || null],
      isParentTask: [this.data.isParentTask || null],
    })
  }

  private loadAssignees() {
    this.projectService
      .getMembers(this.data.projectId)
      .pipe(
        catchError((error) => {
          if (error.error !== 'Người dùng không thuộc dự án.')
            this.notification.error('Lỗi', error.error || 'Lấy danh sách thành viên thất bại!', { nzDuration: 2000 })
          return throwError(() => new Error(error.error))
        })
      )
      .subscribe((members) => {
        this.assignees = members.filter((m) => m.roleInTeam === TeamRole.LEADER || m.roleInTeam === TeamRole.MEMBER)
        this.filteredAssignees = [...this.assignees]
      })
  }

  private loadMilestones() {
    if (this.isMilestoneLoading) return

    this.isMilestoneLoading = true
    this.milestoneService
      .getMilestones(this.data.projectId, this.milestonePage, this.milestoneSize)
      .pipe(
        catchError((error) => {
          if (error.error !== 'Người dùng không thuộc dự án.')
            this.notification.error('Lỗi', error.error || 'Lấy danh sách cột mốc thất bại!', { nzDuration: 2000 })
          return throwError(() => new Error(error.error))
        })
      )
      .subscribe((result) => {
        this.milestones = [...this.milestones, ...result.data]
        this.milestoneTotal = result.total
        this.isMilestoneLoading = false
      })
  }

  onMilestoneScroll() {
    if (this.isMilestoneLoading) return
    if (this.milestonePage * this.milestoneSize >= this.milestoneTotal) return

    this.milestonePage++
    this.loadMilestones()
  }

  nzFilterOption = () => true

  onAssigneeSearch(searchText: string): void {
    const search = searchText.toLowerCase()
    this.filteredAssignees = this.assignees.filter((user) => user.fullName.toLowerCase().includes(search) || user.email.toLowerCase().includes(search))
  }

  resetFilters() {
    this.filterForm.reset({
      title: '',
      assigneeId: null,
      milestoneId: null,
      status: '',
      isLate: false,
      orderMode: null,
    })
    this.filterApplied.emit(this.filterForm.value)
    this.menuState.closeMenu()
  }

  applyFilters() {
    //emit filterform but startdate and enddate to iostring
    const filterData = this.filterForm.value
    // if startDate is type string already then don't convert it to string
    if (typeof filterData.startDate !== 'string') {
      filterData.startDate = filterData.startDate ? filterData.startDate.toISOString() : null
    }
    filterData.endDate = filterData.endDate ? filterData.endDate.toISOString() : null
    this.filterApplied.emit(filterData)
    this.menuState.closeMenu()
  }

  updateForm(filterData: any) {
    if (this.filterForm) {
      this.filterForm.patchValue({
        title: filterData.title || '',
        assigneeId: filterData.assigneeId || null,
        milestoneId: filterData.milestoneId || null,
        status: filterData.status || '',
        isLate: filterData.isLate || false,
      })
    }
  }
}
