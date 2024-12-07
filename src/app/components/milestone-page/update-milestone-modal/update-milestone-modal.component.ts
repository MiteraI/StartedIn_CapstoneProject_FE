import { CommonModule } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzTableModule } from 'ng-zorro-antd/table'
import { Subject, takeUntil } from 'rxjs'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { PhaseService } from 'src/app/services/phase.service'
import { TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { Phase } from 'src/app/shared/models/phase/phase.model'
import { Task } from 'src/app/shared/models/task/task.model'

interface IModalData {
  milestoneId: string
  projectId: string
}

@Component({
  selector: 'app-update-milestone-modal',
  templateUrl: './update-milestone-modal.component.html',
  styleUrls: ['./update-milestone-modal.component.scss'],
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
    NzIconModule,
  ],
})
export class UpdateMilestoneModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  taskStatusLabels = TaskStatusLabels
  milestoneForm: FormGroup
  private destroy$ = new Subject<void>()

  assignedTasks: Task[] = []

  initialPhaseId: string = ''
  initialPhase: Phase | null = null
  phases: Phase[] = []
  isPhasesFetched: boolean = false
  isPhasesFetchLoading = false

  isInfoChanged: boolean = false

  isFetchMilestoneDetailLoading = false

  constructor(
    private fb: FormBuilder,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef,
    private milestoneService: MilestoneService,
    private phaseService: PhaseService) {
    this.milestoneForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      phase: [null]
    })
  }

  onSubmit() {
    if (this.milestoneForm.valid && this.isInfoChanged) {
      const milestone = {
        title: this.milestoneForm.value.title,
        description: this.milestoneForm.value.description,
        startDate: new Date(this.milestoneForm.value.startDate).toISOString().split('T')[0],
        endDate: new Date(this.milestoneForm.value.endDate).toISOString().split('T')[0],
        phaseId: this.milestoneForm.value.phase
      }

      if (new Date(milestone.startDate) > new Date(milestone.endDate)) {
        this.antdNoti.openErrorNotification('Ngày bắt đầu không thể sau ngày kết thúc', '')
        return
      }

      this.milestoneService.updateMilestone(this.nzModalData.projectId, this.nzModalData.milestoneId, milestone).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Cập Nhật Cột Mốc Thành Công', '')
          this.milestoneService.refreshMilestone$.next(true)
          this.nzModalRef.close()
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

  loadMorePhases() {
    this.fetchPhases()
  }

  private fetchPhases() {
    this.isPhasesFetchLoading = true
    this.phaseService
      .getPhases(this.nzModalData.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val) => {
          const morePhases = val.filter((p) => p.id !== this.initialPhaseId)
          this.phases = [...this.phases, ...morePhases]
          this.isPhasesFetchLoading = false
        },
        error: (error: HttpErrorResponse) => {
          this.isPhasesFetchLoading = false
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
              this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
          }
        },
      })
  }

  handleDeleteMilestone() {
    this.milestoneService.deleteMilestone(this.nzModalData.projectId, this.nzModalData.milestoneId).subscribe({
      next: (response) => {
        this.antdNoti.openSuccessNotification('Xóa Cột Mốc Thành Công', '')
        this.milestoneService.refreshMilestone$.next(true)
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

  handleInfoChanged() {
    this.isInfoChanged = true
  }

  ngOnInit() {
    this.isFetchMilestoneDetailLoading = true
    this.milestoneService.getMilestoneDetail(this.nzModalData.projectId, this.nzModalData.milestoneId).subscribe({
      next: (response) => {
        this.milestoneForm.patchValue({
          title: response.title,
          description: response.description,
          startDate: response.startDate,
          endDate: response.endDate,
          phase: response.phase?.id
        })
        this.initialPhaseId = response.phase?.id || ''
        this.initialPhase = response.phase || null
        this.assignedTasks = response.assignedTasks
        this.isFetchMilestoneDetailLoading = false
      },
      error: (error) => {
        this.antdNoti.openErrorNotification('Lỗi', 'Không thể lấy thông tin cột mốc')
        this.nzModalRef.close()
      },
    })
  }
}
