import { Component, Input, OnInit } from '@angular/core'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { Task } from 'src/app/shared/models/task/task.model'
import { TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'
import { NzButtonModule } from 'ng-zorro-antd/button'

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [NzTableModule, NzDividerModule, NzButtonModule],
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.scss'],
})
export class TaskTableComponent implements OnInit {
  @Input({ required: true }) taskList: Task[] = []
  labels = TaskStatusLabels
  constructor() {}

  ngOnInit() {}
}
