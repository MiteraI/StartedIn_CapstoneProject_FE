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
      deadline: [null],
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
          this.antdNoti.openSuccessNotification('Tạo Tác Vụ Thành Công', '')
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

  ngOnInit(): void {
    this.projectService.getMembers(this.nzModalData.projectId).subscribe({
      next: (res) => {
        this.users = res.filter((u) => u.roleInTeam !== TeamRole.INVESTOR && u.roleInTeam !== TeamRole.MENTOR)
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

  private fetchTasks() {
    this.isOtherTasksFetchLoading = true
    //TODO: Add filter logic
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
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
  }

  private fetchMilestones() {
    this.isMilestonesFetchLoading = true
    //TODO: Add filter logic
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
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
          }
        },
      })
  }
}
