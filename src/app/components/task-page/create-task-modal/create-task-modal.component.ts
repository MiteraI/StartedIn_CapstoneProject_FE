import { DatePipe } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { Component, inject, Input, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { ProjectService } from 'src/app/services/project.service'
import { TaskService } from 'src/app/services/task.service'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model'

interface IModalData {
  projectId: string
}

@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzDatePickerModule, ReactiveFormsModule, NzButtonModule, NzSelectModule],
  providers: [DatePipe],
})
export class CreateTaskModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  users: TeamMemberModel[] = []
  milestones: Milestone[] = []
  taskForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private taskService: TaskService,
    private projectService: ProjectService,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      deadline: [null],
      milestone: [null],
      assignees: [[]],
    })
  }

  onSubmit() {
    if (this.taskForm.valid) {
      let deadline = this.taskForm.value.deadline
      if (deadline) {
        deadline = deadline instanceof Date ? deadline : new Date(deadline)
        deadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate(), deadline.getHours(), 0, 0).toISOString()
      }

      const taskData = {
        ...this.taskForm.value,
        deadline: deadline,
      }

      this.taskService.createTask(this.nzModalData.projectId, taskData).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Created Task Successfully', '')
          this.nzModalRef.close()
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

  ngOnInit(): void {
    this.projectService.getMembers(this.nzModalData.projectId).subscribe({
      next: (res) => {
        this.users = res.filter((u) => u.roleInTeam !== TeamRole.INVESTOR && u.roleInTeam !== TeamRole.MENTOR)
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
