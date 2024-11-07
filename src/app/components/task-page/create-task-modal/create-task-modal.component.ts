import { DatePipe } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { Component, inject, Input } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { AntdNotificationService } from 'src/app/services/antd-notification.service'
import { TaskService } from 'src/app/services/task.service'

interface IModalData {
  projectId: string
}

@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzDatePickerModule, ReactiveFormsModule, NzButtonModule],
  providers: [DatePipe],
})
export class CreateTaskModalComponent {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)

  taskForm: FormGroup

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private taskService: TaskService, private antdNoti: AntdNotificationService) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      deadline: [null],
    })
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formattedDeadline = this.taskForm.value.deadline.toISOString()
      const taskData = {
        ...this.taskForm.value,
        deadline: formattedDeadline,
      }

      this.taskService.createTask(this.nzModalData.projectId, taskData).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Created Task Successfully', '')
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openInfoNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
            console.error('', error)
          }
        },
      })
    }
  }
}
