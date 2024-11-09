import { CommonModule, DatePipe } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { AntdNotificationService } from 'src/app/services/antd-notification.service'
import { TaskService } from 'src/app/services/task.service'
import { TaskStatus, TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { UpdateTaskInfo } from 'src/app/shared/models/task/update-task.model'

interface IModalData {
  taskId: string
  projectId: string
}

@Component({
  selector: 'app-update-task-modal',
  templateUrl: './update-task-modal.component.html',
  styleUrls: ['./update-task-modal.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzDatePickerModule, NzButtonModule, NzInputModule, ReactiveFormsModule, CommonModule, NzSelectModule],
  providers: [DatePipe],
})
export class UpdateTaskModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  milestones: { label: string; value: string }[] = []
  statuses: { label: string; value: number }[] = [
    { value: 0, label: TaskStatusLabels[0] },
    { value: 1, label: TaskStatusLabels[1] },
    { value: 2, label: TaskStatusLabels[2] },
    { value: 3, label: TaskStatusLabels[3] },
    { value: 4, label: TaskStatusLabels[4] },
    { value: 5, label: TaskStatusLabels[5] },
  ]
  otherTasks: { label: string; value: string }[] = []
  users: { label: string; value: string }[] = []
  subTasks = []
  comments: { content: string; author: string; date: string }[] = []
  taskForm: FormGroup
  isInfoChanged: boolean = false
  initialStatus: TaskStatus = 0

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private taskService: TaskService, private antdNoti: AntdNotificationService) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      deadline: [null],
      status: [null],
    })
  }

  onSubmit() {
    if (this.taskForm.valid && this.isInfoChanged) {
      const deadline = this.taskForm.value.deadline
      const formattedDeadline = deadline instanceof Date ? deadline.toISOString() : new Date(deadline).toISOString()

      const taskData: UpdateTaskInfo = {
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        deadline: formattedDeadline,
      }

      this.taskService.updateTaskInfo(this.nzModalData.projectId, this.nzModalData.taskId, taskData).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Updated Task Successfully', '')
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openInfoNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
    }
  }

  handleInfoChanged() {
    this.isInfoChanged = true
  }

  handleStatusChanged(status: TaskStatus) {
    if (status !== this.initialStatus) {
      this.taskService.updateTaskStatus(this.nzModalData.projectId, this.nzModalData.taskId, { status: status }).subscribe({
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openInfoNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
    }
  }

  ngOnInit() {
    if (this.nzModalData.taskId) {
      this.taskService.getTaskDetails(this.nzModalData.projectId, this.nzModalData.taskId).subscribe({
        next: (task) => {
          this.taskForm.setValue(
            {
              title: task.title,
              description: task.description,
              deadline: this.datePipe.transform(task.deadline, 'yyyy-MM-dd HH:00:00'),
              status: task.status,
            },
            { emitEvent: false }
          )
          this.initialStatus = task.status
        },
      })
    }
  }
}
