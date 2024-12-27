import { CommonModule, DatePipe } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { TaskService } from 'src/app/services/task.service'
import { TaskStatus, TaskStatusColors, TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { UpdateTaskInfo } from 'src/app/shared/models/task/update-task.model'
import { Task } from 'src/app/shared/models/task/task.model'
import { ProjectService } from 'src/app/services/project.service'
import { NzTableModule } from 'ng-zorro-antd/table'
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { finalize, Subject, takeUntil } from 'rxjs'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { MilestoneService } from 'src/app/services/milestone.service'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { TaskComment } from 'src/app/shared/models/task-comment/task-comment.model'
import { TaskAttachment } from 'src/app/shared/models/task-attachment/task-attachment.model'
import { TaskCommentService } from 'src/app/services/task-comment.service'
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload'
import { MatIconModule } from '@angular/material/icon'
import { TaskAttachmentService } from 'src/app/services/task-attachment.service'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { UserService } from 'src/app/services/user.service'
import { FullProfile } from 'src/app/shared/models/user/full-profile.model'
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular'
import { EDITOR_KEY } from 'src/app/shared/constants/editor-key.constants'
import { LogTaskModalComponent } from '../task-list/log-task-modal/log-task-modal.component'
import { UserTask } from 'src/app/shared/models/task/user-task.model'

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
    FormsModule,
    CommonModule,
    NzSelectModule,
    NzTableModule,
    NzSpinModule,
    NzPopconfirmModule,
    NzInputNumberModule,
    NzTagModule,
    NzUploadModule,
    MatIconModule,
    NzPopoverModule,
    EditorModule,
  ],
  providers: [DatePipe],
})
export class UpdateTaskModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  taskStatusLabels = TaskStatusLabels
  statuses: { label: string; value: number; color: string }[] = [
    { value: 1, label: TaskStatusLabels[1], color: TaskStatusColors[1] },
    { value: 2, label: TaskStatusLabels[2], color: TaskStatusColors[2] },
    { value: 3, label: TaskStatusLabels[3], color: TaskStatusColors[3] },
    { value: 4, label: TaskStatusLabels[4], color: TaskStatusColors[4] },
    { value: 5, label: TaskStatusLabels[5], color: TaskStatusColors[5] },
    { value: 6, label: TaskStatusLabels[6], color: TaskStatusColors[6] },
  ]

  getStatusColor(status: TaskStatus): string {
    return TaskStatusColors[status]
  }

  taskForm: FormGroup
  private destroy$ = new Subject<void>()

  subTasks: Task[] = []
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

  // Attachments handling vars
  fileList: NzUploadFile[] = []
  attachmentList: TaskAttachment[] = []

  // Comments handling vars
  commentList: TaskComment[] = []

  isFetchTaskDetailsLoading: boolean = false

  // log time vars
  expectedManHour: number = 0
  loggedHours: number = 0
  userTasks: UserTask[] = []

  // current user
  currentUser: FullProfile | undefined

  editorKey = EDITOR_KEY
  init: EditorComponent['init'] = {
    plugins: 'lists link code help wordcount image',
    toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | help',
    setup: () => {
      this.handleInfoChanged()
    },
  }

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private taskService: TaskService,
    private milestoneService: MilestoneService,
    private antdNoti: AntdNotificationService,
    private projectService: ProjectService,
    private taskCommentService: TaskCommentService,
    private taskAttachmentService: TaskAttachmentService,
    private nzModalRef: NzModalRef,
    private userService: UserService,
    private modalService: NzModalService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      startDate: [null],
      endDate: [null],
      manHour: [null],
      status: [null],
      parentTask: [''],
      milestone: [null],
      assignees: [[]],
      taskComment: [''],
    })
  }

  disableStartDate = (startDate: Date): boolean => {
    const endDate = this.taskForm.get('endDate')?.value
    const parentTask = this.otherTasks.find((t) => t.id === this.initialParentTaskId) ?? this.initialParentTask

    if (parentTask) {
      const parentTaskStart = new Date(parentTask.startDate)
      const parentTaskEnd = new Date(parentTask.endDate)

      // Start date should be within parent task dates
      if (startDate < parentTaskStart || startDate > parentTaskEnd) {
        return true
      }
    }

    const milestone = this.milestones.find((m) => m.id === this.initialMilestoneId) ?? this.initialMilestone
    if (milestone) {
      const milestoneStart = new Date(milestone.startDate)
      const milestoneEnd = new Date(milestone.endDate)

      // Start date should be within milestone dates
      if (startDate < milestoneStart || startDate > milestoneEnd) {
        return true
      }
    }

    // Start date cannot be after end date
    return !!endDate && startDate > new Date(endDate)
  }

  disableEndDate = (endDate: Date): boolean => {
    const startDate = this.taskForm.get('startDate')?.value
    const parentTask = this.otherTasks.find((t) => t.id === this.initialParentTaskId) ?? this.initialParentTask

    if (parentTask) {
      const parentTaskStart = new Date(parentTask.startDate)
      const parentTaskEnd = new Date(parentTask.endDate)

      // End date should be within parent task dates
      if (endDate < parentTaskStart || endDate > parentTaskEnd) {
        return true
      }
    }

    const milestone = this.milestones.find((m) => m.id === this.initialMilestoneId) ?? this.initialMilestone
    if (milestone) {
      const milestoneStart = new Date(milestone.startDate)
      const milestoneEnd = new Date(milestone.endDate)

      // End date should be within milestone dates
      if (endDate < milestoneStart || endDate > milestoneEnd) {
        return true
      }
    }

    // End date cannot be before start date
    return !!startDate && endDate < new Date(startDate)
  }

  onSubmit() {
    if (this.taskForm.valid && this.isInfoChanged) {
      let startDate = this.taskForm.value.startDate
      if (startDate) {
        startDate = startDate instanceof Date ? startDate : new Date(startDate)
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours(), 0, 0).toISOString()
      }

      let endDate = this.taskForm.value.endDate
      if (endDate) {
        endDate = endDate instanceof Date ? endDate : new Date(endDate)
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endDate.getHours(), 0, 0).toISOString()
      }

      const taskData: UpdateTaskInfo = {
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        startDate: startDate,
        endDate: endDate,
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
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
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
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
          }
        },
      })
    }
  }

  private handleMutualExclusion(milestoneSelected: boolean, value: string) {
    if (!value) return
    if (milestoneSelected) {
      this.taskForm.patchValue({ parentTask: '' })
    } else {
      this.taskForm.patchValue({ milestone: '' })
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
    if (!parentTaskId) {
      this.updateParentTask('', () => this.updateMilestone(this.taskForm.get('milestone')?.value))
      return
    }

    this.handleMutualExclusion(false, parentTaskId)
  }

  updateParentTask(parentTaskId: string, callback: () => void = () => {}) {
    if (parentTaskId === this.initialParentTaskId) {
      callback()
      return
    }
    this.taskService.updateParentTask(this.nzModalData.projectId, this.nzModalData.taskId, { parentTaskId: parentTaskId }).subscribe({
      next: (res) => {
        this.antdNoti.openSuccessNotification('', 'Cập nhật tác vụ mẹ thành công')
        this.initialParentTaskId = parentTaskId
        callback()
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
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
          console.log(this.otherTasks)
        },
        error: (error: HttpErrorResponse) => {
          this.isOtherTasksFetchLoading = false
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
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
              this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
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
              this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
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
    if (!milestoneId) {
      this.updateMilestone('', () => this.updateParentTask(this.taskForm.get('parentTask')?.value))
      return
    }

    this.handleMutualExclusion(true, milestoneId)

    if (milestoneId) {
      const milestone = this.milestones.find((m) => m.id === milestoneId)
      if (milestone) {
        const startDate = this.taskForm.get('startDate')?.value
        const endDate = this.taskForm.get('endDate')?.value

        // Check if current dates are within milestone range
        if (startDate) {
          const taskStart = new Date(startDate)
          const milestoneStart = new Date(milestone.startDate)
          const milestoneEnd = new Date(milestone.endDate)

          if (taskStart < milestoneStart || taskStart > milestoneEnd) {
            this.taskForm.patchValue({ startDate: null })
          }
        }

        if (endDate) {
          const taskEnd = new Date(endDate)
          const milestoneStart = new Date(milestone.startDate)
          const milestoneEnd = new Date(milestone.endDate)

          if (taskEnd < milestoneStart || taskEnd > milestoneEnd) {
            this.taskForm.patchValue({ endDate: null })
          }
        }
      }
    }
  }

  updateMilestone(milestoneId: string, callback: () => void = () => {}) {
    if (milestoneId === this.initialMilestoneId) {
      callback()
      return
    }
    this.taskService.updateTaskMilestone(this.nzModalData.projectId, this.nzModalData.taskId, { milestoneId: milestoneId }).subscribe({
      next: (res) => {
        this.antdNoti.openSuccessNotification('', 'Cập nhật cột mốc thành công')
        this.initialMilestoneId = milestoneId
        callback()
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
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
          console.log(this.milestones)
        },
        error: (error: HttpErrorResponse) => {
          this.isMilestonesFetchLoading = false
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
          }
        },
      })
  }

  handleDeleteTask() {
    this.taskService.deleteTask(this.nzModalData.projectId, this.nzModalData.taskId).subscribe({
      next: (res) => {
        this.antdNoti.openSuccessNotification('', 'Xóa tác vụ thành công')
        this.nzModalRef.close()
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
          this.nzModalRef.close()
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
  }

  // Attachments handling
  beforeUpload = (file: NzUploadFile): boolean => {
    this.taskForm.get('files')?.setErrors(null)
    this.fileList = this.fileList.concat(file)
    return false
  }

  removeUpload = (file: NzUploadFile): boolean => {
    if (this.fileList.length <= 1) {
      this.taskForm.get('files')?.setErrors({ emptyList: true })
    }
    return true
  }

  uploadAttachment() {
    // Get file from taskForm and forEach to upload
    this.fileList.forEach((file) => {
      this.taskAttachmentService.uploadFile(this.nzModalData.projectId, this.nzModalData.taskId, file).subscribe({
        next: (res) => {
          this.antdNoti.openSuccessNotification('', 'Tải lên tệp đính kèm thành công')
          // Remove this file from the fileList
          this.fileList = this.fileList.filter((f) => f.uid !== file.uid)
          this.attachmentList.push(res)
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
          }
        },
      })
    })
  }

  deleteAttachment(attachmentId: string) {
    this.taskAttachmentService.deleteAttachment(this.nzModalData.projectId, this.nzModalData.taskId, attachmentId).subscribe({
      next: (res) => {
        this.antdNoti.openSuccessNotification('', 'Xóa tệp đính kèm thành công')
        this.attachmentList = this.attachmentList.filter((a) => a.id !== attachmentId)
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
  }

  createComment() {
    this.taskCommentService.createComment(this.nzModalData.projectId, this.nzModalData.taskId, { content: this.taskForm.value.taskComment }).subscribe({
      next: (res) => {
        this.antdNoti.openSuccessNotification('', 'Bình luận thành công')
        this.taskForm.patchValue({ taskComment: '' })
        this.commentList.push(res)
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
  }

  ngOnInit() {
    if (this.nzModalData.taskId) {
      this.isFetchTaskDetailsLoading = true
      this.taskService
        .getTaskDetails(this.nzModalData.projectId, this.nzModalData.taskId)
        .pipe(finalize(() => (this.isFetchTaskDetailsLoading = false)))
        .subscribe({
          next: (task) => {
            this.initialAssigneeIds = task.assignees.map((user) => user.id)
            this.initialStatus = task.status
            this.initialParentTaskId = task.parentTask === null ? '' : task.parentTask.id
            this.initialParentTask = task.parentTask
            this.initialMilestoneId = task.milestone === null ? '' : task.milestone.id
            this.initialMilestone = task.milestone
            this.subTasks = task.subTasks
            this.commentList = task.taskComments
            this.attachmentList = task.taskAttachments
            this.expectedManHour = task.expectedManHour
            this.loggedHours = task.actualManHour
            this.userTasks = task.userTasks
            this.taskForm.setValue(
              {
                title: task.title,
                description: task.description,
                startDate: this.datePipe.transform(task.startDate, 'yyyy-MM-dd HH:00:00'),
                endDate: this.datePipe.transform(task.endDate, 'yyyy-MM-dd HH:00:00'),
                status: task.status,
                manHour: task.expectedManHour,
                parentTask: task.parentTask === null ? '' : task.parentTask.id,
                milestone: task.milestone === null ? '' : task.milestone.id,
                assignees: task.assignees.map((user) => user.id),
                taskComment: '',
              },
              { emitEvent: false }
            )
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 400) {
              this.antdNoti.openErrorNotification('', error.error)
            } else if (error.status === 500) {
              this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
            } else {
            }
          },
        })

      this.getCurrentUser()
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
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
  }

  private updateFilteredUsers() {
    const selectedUsers: string[] = this.taskForm.get('assignees')?.value || []
    this.filteredUsers = this.users.filter((user) => !selectedUsers.includes(user.id))
  }

  // get current user
  getCurrentUser() {
    return this.userService.getFullProfile().subscribe({
      next: (res) => {
        this.currentUser = res
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
  }

  // check if the task is assigned to current user
  isAssignedToMe(): boolean {
    return this.initialAssigneeIds.includes(this.currentUser?.id ?? '')
  }

  openLogWorkModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Ghi nhận giờ làm',
      nzContent: LogTaskModalComponent,
      nzWidth: '600px',
      nzBodyStyle: { padding: '0px' },
      nzData: {
        taskId: this.nzModalData.taskId,
        projectId: this.nzModalData.projectId,
        expectedManHour: this.expectedManHour,
        actualManHour: this.loggedHours,
        status: this.taskForm.get('status')?.value,
        assignees: this.userTasks
      },
      nzFooter: null
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        // Refresh task details to get updated hours
        this.ngOnInit();
      }
    });
  }
}
