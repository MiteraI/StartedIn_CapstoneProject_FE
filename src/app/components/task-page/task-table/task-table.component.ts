import { Component, Input, OnInit } from '@angular/core'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { Task } from 'src/app/shared/models/task/task.model'

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [NzTableModule, NzDividerModule],
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.scss'],
})
export class TaskTableComponent implements OnInit {
  @Input() taskList: Task[] = []

  constructor() {}

  ngOnInit() {}
}
