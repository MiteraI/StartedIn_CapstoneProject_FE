import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { Task } from 'src/app/shared/models/task/task.model'
import { TaskStatusLabels } from 'src/app/shared/enums/task-status.enum'

@Component({
  selector: 'app-task-list-item',
  templateUrl: './task-list-item.component.html',
  styleUrls: ['./task-list-item.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TaskListItemComponent implements OnInit {
  @Input({ required: true }) task: Task | null = null
  taskStatusLabels = TaskStatusLabels

  constructor() {}

  ngOnInit() {}
}
