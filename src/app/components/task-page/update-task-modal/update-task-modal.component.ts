import { CommonModule, DatePipe } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { AntdNotificationService } from 'src/app/services/antd-notification.service'
import { TaskService } from 'src/app/services/task.service'
import { TaskStatus, TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { UpdateTaskInfo } from 'src/app/shared/models/task/update-task.model'
import { Task } from 'src/app/shared/models/task/task.model'
import { Milestone } from 'src/app/shared/models/project-charter/project-charter.model'
import { ProjectService } from 'src/app/services/project.service'
import { NzTableModule } from 'ng-zorro-antd/table'
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model'

interface IModalData {
  taskId: string
  projectId: string
  taskList: Task[]
}

@Component({
  selector: 'app-update-task-modal',
  templateUrl: './update-task-modal.component.html',
  styleUrls: ['./update-task-modal.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzDatePickerModule, NzButtonModule, NzInputModule, ReactiveFormsModule, CommonModule, NzSelectModule, NzTableModule],
  providers: [DatePipe],
})
export class UpdateTaskModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  taskStatusLabels = TaskStatusLabels
  statuses: { label: string; value: number }[] = [
    { value: 0, label: TaskStatusLabels[0] },
    { value: 1, label: TaskStatusLabels[1] },
    { value: 2, label: TaskStatusLabels[2] },
    { value: 3, label: TaskStatusLabels[3] },
    { value: 4, label: TaskStatusLabels[4] },
    { value: 5, label: TaskStatusLabels[5] },
  ]
  milestones: Milestone[] = []
  otherTasks: Task[] = this.nzModalData.taskList.filter((task) => task.id !== this.nzModalData.taskId)
  users: TeamMemberModel[] = []
  filteredUsers: TeamMemberModel[] = []
  initialAssigneeIds: string[] = []
  subTasks: Task[] = []
  comments: { content: string; author: string; date: string }[] = []
  taskForm: FormGroup
  isInfoChanged: boolean = false
  initialStatus: TaskStatus = 0
  initialParentTaskId: string = ''
  isMilestoneFetched: boolean = false
  isOtherTasksFetched: boolean = false

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private taskService: TaskService,
    private antdNoti: AntdNotificationService,
    private projectService: ProjectService,
    private nzModalRef: NzModalRef
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      deadline: [null],
      status: [null],
      parentTask: [''],
      milestone: [null],
      assignees: [[]],
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
          this.nzModalRef.close(response)
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
        next: (res) => {
          this.initialStatus = status
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

  handleOpenAssigneeSelect() {
    this.updateFilteredUsers()
  }

  handleSelectParentTask(parentTaskId: string) {
    if (parentTaskId !== this.initialParentTaskId) {
      this.taskService.updateParentTask(this.nzModalData.projectId, this.nzModalData.taskId, { parentTaskId: parentTaskId }).subscribe({
        next: (res) => {
          this.initialParentTaskId = parentTaskId
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

  handleSelectAssignChanged(currentSelectedIds: string[]) {
    if (currentSelectedIds.length > this.initialAssigneeIds.length) {
      const addedId = currentSelectedIds.find((id) => !this.initialAssigneeIds.includes(id))
      if (addedId && !this.initialAssigneeIds.includes(addedId)) {
        this.initialAssigneeIds.push(addedId)
        this.filteredUsers = this.filteredUsers.filter((u) => u.id !== addedId)
        this.taskService.updateTaskAssignment(this.nzModalData.projectId, this.nzModalData.taskId, { assigneeId: addedId }).subscribe({
          next: (res) => {},
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

    // If current selection is shorter, we removed an ID
    else {
      const removedId = this.initialAssigneeIds.find((id: string) => !currentSelectedIds.includes(id))
      if (removedId) {
        this.initialAssigneeIds = this.initialAssigneeIds.filter((id) => id !== removedId)
        this.filteredUsers.push(...this.users.filter((u) => u.id === removedId))
        this.taskService.updateTaskUnassignment(this.nzModalData.projectId, this.nzModalData.taskId, { assigneeId: removedId }).subscribe({
          next: (res) => {},
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
  }

  handleOpenMilestoneSelect() {
    if (!this.isMilestoneFetched) {
      // Fetch milestones
    }
  }

  ngOnInit() {
    if (this.nzModalData.taskId) {
      this.taskService.getTaskDetails(this.nzModalData.projectId, this.nzModalData.taskId).subscribe({
        next: (task) => {
          this.initialAssigneeIds = task.assignees.map((user) => user.id)
          this.initialStatus = task.status
          this.initialParentTaskId = task.parentTask === null ? '' : task.parentTask.id
          this.subTasks = task.subTasks
          this.taskForm.setValue(
            {
              title: task.title,
              description: task.description,
              deadline: this.datePipe.transform(task.deadline, 'yyyy-MM-dd HH:00:00'),
              status: task.status,
              parentTask: task.parentTask === null ? '' : task.parentTask.id,
              milestone: task.milestone ?? null,
              assignees: task.assignees.map((user) => user.id),
            },
            { emitEvent: false }
          )
        },
      })
    }

    this.projectService.getMembersInProject(this.nzModalData.projectId).subscribe({
      next: (res) => {
        this.users = res
        this.filteredUsers = res
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

  private updateFilteredUsers() {
    const selectedUsers: string[] = this.taskForm.get('assignees')?.value || []
    this.filteredUsers = this.users.filter((user) => !selectedUsers.includes(user.id))
  }
}
