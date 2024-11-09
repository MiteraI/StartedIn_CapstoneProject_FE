import { Component, Input, OnInit } from '@angular/core'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { Task } from 'src/app/shared/models/task/task.model'
import { TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { UpdateTaskModalComponent } from '../update-task-modal/update-task-modal.component'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [NzTableModule, NzDividerModule, NzButtonModule, NzModalModule, CommonModule],
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.scss'],
})
export class TaskTableComponent implements OnInit {
  @Input({ required: true }) taskList: Task[] = []
  @Input({ required: true }) projectId: string = ''
  labels = TaskStatusLabels

  constructor(private modalService: NzModalService) {}

  ngOnInit() {}

  openUpdateTaskModal(taskId: string) {
    const modalRef = this.modalService.create({
      nzTitle: 'Thông Tin Tác Vụ',
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px' },
      nzContent: UpdateTaskModalComponent,
      nzData: {
        taskId: taskId,
        projectId: this.projectId,
        taskList: this.taskList,
      },
      nzFooter: null,
    })
  }
}
