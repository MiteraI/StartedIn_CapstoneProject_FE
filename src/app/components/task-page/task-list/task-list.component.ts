import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { Task } from 'src/app/shared/models/task/task.model'
import { TaskListItemComponent } from './task-list-item/task-list-item.component'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { UpdateTaskModalComponent } from '../update-task-modal/update-task-modal.component'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzListModule } from 'ng-zorro-antd/list'

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [TaskListItemComponent, NzModalModule, NzSpinModule, NzListModule],
})
export class TaskListComponent implements OnInit {
  @Input({ required: true }) taskList: Task[] = []
  @Input({ required: true }) projectId: string = ''
  @Input({ required: true }) isFetchAllTaskLoading: boolean = false
  @Input() total: number = 0
  @Input() size: number = 10
  @Input() page: number = 1

  constructor(private modalService: NzModalService) {}

  ngOnInit() {}

  openUpdateTaskModal(taskId: string) {
    const modalRef = this.modalService.create({
      nzTitle: 'Thông Tin Tác Vụ',
      nzWidth: '90vw',
      nzStyle: { top: '20px', maxWidth: '800px' },
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
