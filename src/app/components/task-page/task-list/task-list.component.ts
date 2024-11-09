import { Component, Input, OnInit } from '@angular/core'
import { Task } from 'src/app/shared/models/task/task.model'
import { TaskListItemComponent } from './task-list-item/task-list-item.component'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { UpdateTaskModalComponent } from '../update-task-modal/update-task-modal.component'

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [TaskListItemComponent, NzModalModule],
})
export class TaskListComponent implements OnInit {
  @Input({ required: true }) taskList: Task[] = []
  @Input({ required: true }) projectId: string = ''

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
      },
      nzFooter: null,
    })
  }
}
