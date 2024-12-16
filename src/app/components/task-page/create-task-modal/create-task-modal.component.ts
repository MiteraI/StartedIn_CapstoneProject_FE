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
import { Subject, takeUntil } from 'rxjs'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { ProjectService } from 'src/app/services/project.service'
import { TaskService } from 'src/app/services/task.service'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model'
import { Task } from 'src/app/shared/models/task/task.model'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { MilestoneService } from 'src/app/services/milestone.service'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'

interface IModalData {
  projectId: string
  milestoneId: string
  milestoneName: string
}

@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzDatePickerModule, ReactiveFormsModule, NzButtonModule, NzSelectModule, NzIconModule, NzInputNumberModule],
  providers: [DatePipe],
})
export class CreateTaskModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  users: TeamMemberModel[] = []
  taskForm: FormGroup
  private destroy$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private taskService: TaskService,
    private milestoneService: MilestoneService,
    private projectService: ProjectService,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      startDate: [null],
      endDate: [null],
      milestone: [null],
      assignees: [[]],
      manHour: [0],
      parentTask: [null],
    })
  }

  // Parent task handling vars
  otherTasks: Task[] = []
  isOtherTasksFetched: boolean = false
  isOtherTasksFetchLoading = false
  otherTasksPage = 1
  otherTasksSize = 10
  otherTasksTotal = 0

  // Milestone handling vars
  milestones: Milestone[] = []
  isMilestonesFetched: boolean = false
  isMilestonesFetchLoading = false
  milestonesPage = 1
  milestonesSize = 10
  milestonesTotal = 0

  disableStartDate = (startDate: Date): boolean => {
    const endDate = this.taskForm.get('endDate')?.value
    const parentTask = this.otherTasks.find((t) => t.id === this.taskForm.get('parentTask')?.value)

    if (parentTask) {
      const parentTaskStart = new Date(parentTask.startDate)
      const parentTaskEnd = new Date(parentTask.endDate)

      // Start date should be within parent task dates
      if (startDate < parentTaskStart || startDate > parentTaskEnd) {
        return true
      }
    }

    const milestone = this.milestones.find((m) => m.id === this.taskForm.get('milestone')?.value)

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
    const parentTask = this.otherTasks.find((t) => t.id === this.taskForm.get('parentTask')?.value)

    if (parentTask) {
      const parentTaskStart = new Date(parentTask.startDate)
      const parentTaskEnd = new Date(parentTask.endDate)

      // End date should be within parent task dates
      if (endDate < parentTaskStart || endDate > parentTaskEnd) {
        return true
      }
    }

    const milestone = this.milestones.find((m) => m.id === this.taskForm.get('milestone')?.value)

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

  handleSelectParentTask(parentTaskId: string) {
    if (parentTaskId) {
      this.taskForm.get('milestone')?.setValue(null)
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

  handleSelectMilestone(milestoneId: string) {
    if (milestoneId) {
      this.taskForm.get('parentTask')?.setValue(null)

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

  onSubmit() {
    if (this.taskForm.valid) {
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

      const taskData = {
        ...this.taskForm.value,
        startDate: startDate,
        endDate: endDate,
      }

      this.taskService.createTask(this.nzModalData.projectId, taskData).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Tạo Tác Vụ Thành Công', '')
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

  ngOnInit(): void {
    this.projectService.getMembers(this.nzModalData.projectId).subscribe({
      next: (res) => {
        this.users = res.filter((u) => u.roleInTeam !== TeamRole.INVESTOR && u.roleInTeam !== TeamRole.MENTOR)
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

    if (this.nzModalData.milestoneId) {
      this.taskForm.get('milestone')?.setValue(this.nzModalData.milestoneId)
    }
  }

  private fetchTasks() {
    this.isOtherTasksFetchLoading = true
    this.taskService
      .getTaskListForProject(this.nzModalData.projectId, this.otherTasksPage, this.otherTasksSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val) => {
          this.otherTasks = [...this.otherTasks, ...val.data]
          this.otherTasksTotal = val.total
          this.isOtherTasksFetchLoading = false
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

  private fetchMilestones() {
    this.isMilestonesFetchLoading = true
    this.milestoneService
      .getMilestones(this.nzModalData.projectId, this.milestonesPage, this.milestonesSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val) => {
          this.milestones = [...this.milestones, ...val.data]
          this.milestonesTotal = val.total
          this.isMilestonesFetchLoading = false
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
}
