import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { Task } from 'src/app/shared/models/task/task.model'
import { TaskStatus, TaskStatusColors, TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { UpdateTaskModalComponent } from '../update-task-modal/update-task-modal.component'
import { CommonModule } from '@angular/common'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { TaskService } from 'src/app/services/task.service'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzTagModule } from 'ng-zorro-antd/tag'

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [NzTableModule, NzDividerModule, NzButtonModule, NzModalModule, CommonModule, NzPopconfirmModule, NzTagModule],
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.scss'],
})
export class TaskTableComponent implements OnInit {
  @Output() pageChanged = new EventEmitter<number>()
  @Input({ required: true }) taskList: Task[] = []
  @Input({ required: true }) projectId: string = ''
  @Input({ required: true }) isFetchAllTaskLoading: boolean = false
  @Input() total: number = 0
  @Input() size: number = 10
  @Input() page: number = 1

  labels = TaskStatusLabels

  constructor(private modalService: NzModalService, private antdNoti: AntdNotificationService, private taskService: TaskService) {}

  ngOnInit() {}

  handleDeleteTask(taskId: string) {
    this.taskService.deleteTask(this.projectId, taskId).subscribe({
      next: (res) => {
        this.antdNoti.openSuccessNotification('', 'Xóa tác vụ thành công')
        this.taskService.refreshTask$.next(true)
      },
      error: (error) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
  }

  openUpdateTaskModal(taskId: string) {
    const modalRef = this.modalService.create({
      nzTitle: 'Thông Tin Tác Vụ',
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px' },
      nzContent: UpdateTaskModalComponent,
      nzData: {
        taskId: taskId,
        projectId: this.projectId,
      },
      nzFooter: null,
    })
  }

  getStatusColor(status: TaskStatus): string {
    return TaskStatusColors[status]
  }

  onPageChange(page: number) {
    this.pageChanged.emit(page)
  }
}
