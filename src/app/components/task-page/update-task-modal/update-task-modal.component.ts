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
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { TaskService } from 'src/app/services/task.service'
import { TaskStatus, TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { UpdateTaskInfo } from 'src/app/shared/models/task/update-task.model'
import { Task } from 'src/app/shared/models/task/task.model'
import { ProjectService } from 'src/app/services/project.service'
import { NzTableModule } from 'ng-zorro-antd/table'
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { Subject, takeUntil } from 'rxjs'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { MilestoneService } from 'src/app/services/milestone.service'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'

interface IModalData {
  taskId: string
  projectId: string
}

@Component({
  selector: 'app-update-task-modal',
  templateUrl: './update-task-modal.component.html',
  styleUrls: ['./update-task-modal.component.scss'],
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
    NzInputNumberModule,
  ],
  providers: [DatePipe],
})
export class UpdateTaskModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  taskStatusLabels = TaskStatusLabels
  statuses: { label: string; value: number }[] = [
    { value: 1, label: TaskStatusLabels[1] },
    { value: 2, label: TaskStatusLabels[2] },
    { value: 3, label: TaskStatusLabels[3] },
    { value: 4, label: TaskStatusLabels[4] },
    { value: 5, label: TaskStatusLabels[5] },
    { value: 6, label: TaskStatusLabels[6] },
  ]
  taskForm: FormGroup
  private destroy$ = new Subject<void>()

  subTasks: Task[] = []
  comments: { content: string; author: string; date: string }[] = []
  isInfoChanged: boolean = false
  initialStatus: TaskStatus = 1

  // Assignee handling vars
  users: TeamMemberModel[] = []
  filteredUsers: TeamMemberModel[] = []
  initialAssigneeIds: string[] = []

  // Parent task handling vars
  initialParentTaskId: string = ''
  initialParentTask: Task | null = null //for showing up in the select, because only when click on the the select then task list will be loaded
  otherTasks: Task[] = []
  isOtherTasksFetched: boolean = false
  isOtherTasksFetchLoading = false
  otherTasksPage = 1
  otherTasksSize = 10
  otherTasksTotal = 0

  // Milestone assign handling vars
  initialMilestoneId: string = ''
  initialMilestone: Milestone | null = null
  milestones: Milestone[] = []
  isMilestonesFetched: boolean = false
  isMilestonesFetchLoading = false
  milestonesPage = 1
  milestonesSize = 10
  milestonesTotal = 0

  isFetchTaskDetailsLoading: boolean = false

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private taskService: TaskService,
    private milestoneService: MilestoneService,
    private antdNoti: AntdNotificationService,
    private projectService: ProjectService,
    private nzModalRef: NzModalRef
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      deadline: [null],
      manHour: [null],
      status: [null],
      parentTask: [''],
      milestone: [null],
      assignees: [[]],
    })
  }

  onSubmit() {
    if (this.taskForm.valid && this.isInfoChanged) {
      let deadline = this.taskForm.value.deadline
      if (deadline) {
        deadline = deadline instanceof Date ? deadline : new Date(deadline)
        deadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate(), deadline.getHours(), 0, 0).toISOString()
      }

      const taskData: UpdateTaskInfo = {
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        deadline: deadline,
        manHour: this.taskForm.value.manHour,
      }

      this.taskService.updateTaskInfo(this.nzModalData.projectId, this.nzModalData.taskId, taskData).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Cập Nhật Tác Vụ Thành Công', '')
          this.nzModalRef.close(response)
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
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
          this.antdNoti.openSuccessNotification('', 'Cập nhật trạng thái thành công')
          this.initialStatus = status
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
    }
  }

  handleOpenParentTask() {
    if (!this.isOtherTasksFetched) {
      this.isOtherTasksFetched = true
      this.fetchTasks()
    }
  }

  loadMoreOtherTasks() {
    if (this.otherTasksPage * this.otherTasksSize >= this.otherTasksTotal) return
    this.otherTasksPage = this.otherTasksPage + 1
    this.fetchTasks()
  }

  handleSelectParentTask(parentTaskId: string) {
    if (parentTaskId !== this.initialParentTaskId) {
      this.taskService.updateParentTask(this.nzModalData.projectId, this.nzModalData.taskId, { parentTaskId: parentTaskId }).subscribe({
        next: (res) => {
          this.initialParentTaskId = parentTaskId
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
    }
  }

  private fetchTasks() {
    this.isOtherTasksFetchLoading = true
    this.taskService
      .getTaskListForProject(this.nzModalData.projectId, this.otherTasksPage, this.otherTasksSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val) => {
          const tasks = val.data.filter((t) => t.id !== this.initialParentTaskId && t.id !== this.nzModalData.taskId)
          this.otherTasks = [...this.otherTasks, ...tasks]
          this.otherTasksTotal = val.total
          this.isOtherTasksFetchLoading = false
        },
        error: (error: HttpErrorResponse) => {
          this.isOtherTasksFetchLoading = false
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
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
              this.antdNoti.openErrorNotification('', error.error)
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
              this.antdNoti.openErrorNotification('', error.error)
            } else if (error.status === 500) {
              this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
            } else {
            }
          },
        })
      }
    }
  }

  handleOpenAssigneeSelect() {
    this.updateFilteredUsers()
  }

  handleSelectMilestone(milestoneId: string) {
    if (milestoneId !== this.initialParentTaskId) {
      this.taskService.updateTaskMilestone(this.nzModalData.projectId, this.nzModalData.taskId, { milestoneId: milestoneId }).subscribe({
        next: (res) => {
          this.antdNoti.openSuccessNotification('', 'Cập nhật cột mốc thành công')
          this.initialMilestoneId = milestoneId
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
    }
  }

  handleOpenMilestoneSelect() {
    if (!this.isMilestonesFetched) {
      // Fetch milestones
      this.isMilestonesFetched = true
      this.fetchMilestones()
    }
  }

  loadMoreMilestones() {
    if (this.milestonesPage * this.milestonesSize >= this.milestonesTotal) return
    this.milestonesPage = this.milestonesPage + 1
    this.fetchMilestones()
  }

  private fetchMilestones() {
    this.isMilestonesFetchLoading = true
    this.milestoneService
      .getMilestones(this.nzModalData.projectId, this.milestonesPage, this.milestonesSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val) => {
          const moreMilestones = val.data.filter((m) => m.id !== this.initialMilestoneId && m.id)
          this.milestones = [...this.milestones, ...moreMilestones]
          this.milestonesTotal = val.total
          this.isMilestonesFetchLoading = false
        },
        error: (error: HttpErrorResponse) => {
          this.isMilestonesFetchLoading = false
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
  }

  handleDeleteTask() {
    this.taskService.deleteTask(this.nzModalData.projectId, this.nzModalData.taskId).subscribe({
      next: (res) => {
        this.antdNoti.openSuccessNotification('', 'Xóa tác vụ thành công')
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
        } else {
        }
      },
    })
  }

  ngOnInit() {
    if (this.nzModalData.taskId) {
      this.isFetchTaskDetailsLoading = true
      this.taskService.getTaskDetails(this.nzModalData.projectId, this.nzModalData.taskId).subscribe({
        next: (task) => {
          this.initialAssigneeIds = task.assignees.map((user) => user.id)
          this.initialStatus = task.status
          this.initialParentTaskId = task.parentTask === null ? '' : task.parentTask.id
          this.initialParentTask = task.parentTask
          this.initialMilestoneId = task.milestone === null ? '' : task.milestone.id
          this.initialMilestone = task.milestone
          this.subTasks = task.subTasks
          this.taskForm.setValue(
            {
              title: task.title,
              description: task.description,
              deadline: this.datePipe.transform(task.deadline, 'yyyy-MM-dd HH:00:00'),
              status: task.status,
              manHour: task.manHour,
              parentTask: task.parentTask === null ? '' : task.parentTask.id,
              milestone: task.milestone === null ? '' : task.milestone.id,
              assignees: task.assignees.map((user) => user.id),
            },
            { emitEvent: false }
          )
          this.isFetchTaskDetailsLoading = false
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
          this.isFetchTaskDetailsLoading = false
        },
      })
    }

    this.projectService.getMembers(this.nzModalData.projectId).subscribe({
      next: (res) => {
        this.users = res.filter((u) => u.roleInTeam !== TeamRole.INVESTOR && u.roleInTeam !== TeamRole.MENTOR)
        this.filteredUsers = res
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
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
