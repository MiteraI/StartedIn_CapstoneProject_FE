import { CommonModule, Location } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzTableModule } from 'ng-zorro-antd/table'
import { finalize, Subject, takeUntil, tap } from 'rxjs'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { PhaseService } from 'src/app/services/phase.service'
import { TaskStatus, TaskStatusColors, TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { Phase } from 'src/app/shared/models/phase/phase.model'
import { Task } from 'src/app/shared/models/task/task.model'
import { CreateTaskModalComponent } from '../../task-page/create-task-modal/create-task-modal.component'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { TaskService } from 'src/app/services/task.service'
import { EDITOR_KEY } from 'src/app/shared/constants/editor-key.constants'
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular'
import { NzTagModule } from 'ng-zorro-antd/tag'

@Component({
  selector: 'app-milestone-details-page',
  templateUrl: './milestone-details-page.component.html',
  styleUrls: ['./milestone-details-page.component.scss'],
  standalone: true,
  imports: [
    NzFormModule,
    NzDatePickerModule,
    NzButtonModule,
    NzInputModule,
    ReactiveFormsModule,
    CommonModule,
    NzSelectModule,
    NzTableModule,
    NzSpinModule,
    NzPopconfirmModule,
    MatIconModule,
    NzModalModule,
    RouterModule,
    EditorModule,
    NzTagModule,
  ],
})
export class MilestoneDetailsPageComponent implements OnInit {
  taskStatusLabels = TaskStatusLabels
  milestoneForm: FormGroup
  private destroy$ = new Subject<void>()
  projectId: string = ''
  milestoneId: string = ''
  isLeader: boolean = false

  assignedTasks: Task[] = []

  initialPhaseId: string = ''
  initialPhase: Phase | null = null
  phases: Phase[] = []
  isPhasesFetched: boolean = false
  isPhasesFetchLoading = false

  isInfoChanged: boolean = false

  isFetchMilestoneDetailLoading = false

  editorKey = EDITOR_KEY
  init: EditorComponent['init'] = {
    plugins: 'lists link code help wordcount image',
    toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | help',
    setup: () => {},
  }

  constructor(
    private fb: FormBuilder,
    private antdNoti: AntdNotificationService,
    private activatedRoute: ActivatedRoute,
    private roleService: RoleInTeamService,
    private milestoneService: MilestoneService,
    private taskService: TaskService,
    private location: Location,
    private router: Router,
    private phaseService: PhaseService,
    private modalService: NzModalService
  ) {
    this.milestoneForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      phase: [null],
    })
  }

  onSubmit() {
    if (this.milestoneForm.valid && this.isInfoChanged) {
      const milestone = {
        title: this.milestoneForm.value.title,
        description: this.milestoneForm.value.description,
        startDate: new Date(this.milestoneForm.value.startDate).toISOString().split('T')[0],
        endDate: new Date(this.milestoneForm.value.endDate).toISOString().split('T')[0],
        phaseId: this.milestoneForm.value.phase ? this.milestoneForm.value.phase : null,
      }

      if (new Date(milestone.startDate) > new Date(milestone.endDate)) {
        this.antdNoti.openErrorNotification('Ngày bắt đầu không thể sau ngày kết thúc', '')
        return
      }

      this.milestoneService.updateMilestone(this.projectId, this.milestoneId, milestone).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Cập Nhật Cột Mốc Thành Công', '')
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
            console.error('', error)
          }
        },
      })
    }
  }

  handleOpenPhasesSelect() {
    if (!this.isPhasesFetched) {
      // Fetch milestones
      this.isPhasesFetched = true
      this.fetchPhases()
    }
  }

  disableStartDate = (startDate: Date): boolean => {
    // disable start date before today
    return startDate ? new Date(startDate) < new Date() : false
  }

  disableEndDate = (endDate: Date): boolean => {
    // disable end date before start date
    return endDate ? new Date(endDate) < new Date(this.milestoneForm.value.startDate) : false
  }

  loadMorePhases() {
    this.fetchPhases()
  }

  private fetchPhases() {
    this.isPhasesFetchLoading = true
    this.phaseService
      .getPhases(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val) => {
          const morePhases = val.filter((p) => p.id !== this.initialPhaseId)
          this.phases = [...this.phases, ...morePhases]
          this.isPhasesFetchLoading = false
        },
        error: (error: HttpErrorResponse) => {
          this.isPhasesFetchLoading = false
          if (error.status === 400 && error.error === 'Không tìm thấy tuyên ngôn dự án.') {
          } else if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          }
        },
      })
  }

  handleDeleteMilestone() {
    this.milestoneService.deleteMilestone(this.projectId, this.milestoneId).subscribe({
      next: (response) => {
        this.antdNoti.openSuccessNotification('Xóa Cột Mốc Thành Công', '')
        this.back()
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
          console.error('', error)
        }
      },
    })
  }

  getStatusColor(status: TaskStatus): string {
    return TaskStatusColors[status]
  }

  back() {
    this.location.back()
  }

  handleInfoChanged() {
    this.isInfoChanged = true
  }

  openCreateTaskModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Tác Vụ Mới',
      nzStyle: { top: '20px', maxWidth: '800px' },
      nzBodyStyle: { padding: '0px' },
      nzWidth: '90vw',
      nzContent: CreateTaskModalComponent,
      nzData: {
        projectId: this.projectId,
        milestoneId: this.milestoneId,
        milestoneName: this.milestoneForm.value.title,
      },
      nzFooter: null,
    })
  }

  naviagteToTaskView() {
    this.router.navigate(['/projects', this.projectId, 'tasks'], { queryParams: { milestoneId: this.milestoneId } })
  }

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.milestoneId = value.get('milestoneId')!
      this.roleService.role$.subscribe((role) => {
        if (!role) return
        this.isLeader = role === TeamRole.LEADER
      })
    })
    this.activatedRoute.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.projectId = value.get('id')!
    })
    this.isFetchMilestoneDetailLoading = true
    this.fetchMilestoneDetail()
  }

  private fetchMilestoneDetail() {
    this.milestoneService
      .getMilestoneDetail(this.projectId, this.milestoneId)
      .pipe(
        tap(() => (this.isFetchMilestoneDetailLoading = true)),
        finalize(() => {
          this.isFetchMilestoneDetailLoading = false
          this.isInfoChanged = false
        })
      )
      .subscribe({
        next: (response) => {
          this.milestoneForm.patchValue({
            title: response.title,
            description: response.description,
            startDate: response.startDate,
            endDate: response.endDate,
            phase: response.phase?.id,
          })
          this.initialPhaseId = response.phase?.id || ''
          this.initialPhase = response.phase || null
          this.assignedTasks = response.assignedTasks
        },
        error: (error: HttpErrorResponse) => {
          this.antdNoti.openErrorNotification('Lỗi', 'Không thể lấy thông tin cột mốc')
        },
      })
  }
}
