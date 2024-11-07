import { Component, Input, OnInit } from '@angular/core'
import { Task } from 'src/app/shared/models/task/task.model'
import { TaskListItemComponent } from './task-list-item/task-list-item.component'

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [TaskListItemComponent]
})
export class TaskListComponent implements OnInit {
  @Input({ required: true }) taskList: Task[] = []
  constructor() {}

  ngOnInit() {}
}
