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
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum'
import { TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
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
  milestoneForm: FormGroup

  taskStatusLabels = TaskStatusLabels

  phaseNames: { label: string; value: number }[] = [
    { value: 0, label: PhaseStateLabels[1] },
    { value: 1, label: PhaseStateLabels[2] },
    { value: 2, label: PhaseStateLabels[3] },
    { value: 3, label: PhaseStateLabels[4] },
  ]

  assignedTasks: Task[] = []

  isInfoChanged: boolean = false
  isFetchMilestoneDetailLoading = false

  constructor(private fb: FormBuilder, private antdNoti: AntdNotificationService, private nzModalRef: NzModalRef, private milestoneService: MilestoneService) {
    this.milestoneForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    })
  }

  onSubmit() {
    if (this.milestoneForm.valid && this.isInfoChanged) {
      const milestone = {
        title: this.milestoneForm.value.title,
        description: this.milestoneForm.value.description,
        startDate: new Date(this.milestoneForm.value.startDate).toISOString().split('T')[0],
        endDate: new Date(this.milestoneForm.value.endDate).toISOString().split('T')[0],
      }

      if (new Date(milestone.startDate) > new Date(milestone.endDate)) {
        this.antdNoti.openErrorNotification('Ngày bắt đầu không thể sau ngày kết thúc', '')
        return
      }

      this.milestoneService.updateMilestone(this.nzModalData.projectId, this.nzModalData.milestoneId, milestone).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Cập Nhật Cột Mốc Thành Công', '')
          this.nzModalRef.close()
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
            console.error('', error)
          }
        },
      })
    }
  }

  handleDeleteMilestone() {
    this.milestoneService.deleteMilestone(this.nzModalData.projectId, this.nzModalData.milestoneId).subscribe({
      next: (response) => {
        this.antdNoti.openSuccessNotification('Xóa Cột Mốc Thành Công', '')
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
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
        this.milestoneForm.setValue({
          title: response.title,
          description: response.description,
          startDate: response.startDate,
          endDate: response.endDate,
        })
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
