import { Component, Input, OnInit } from '@angular/core'
import { Task } from 'src/app/shared/models/task/task.model'
import { DateDisplayPipe } from 'src/app/shared/pipes/date-display.pipe'

@Component({
  selector: 'app-task-list-item',
  templateUrl: './task-list-item.component.html',
  styleUrls: ['./task-list-item.component.scss'],
  standalone: true,
  imports: [DateDisplayPipe]
})
export class TaskListItemComponent implements OnInit {
  @Input({ required: true }) task: Task | null = null

  constructor() {}

  ngOnInit() {}
}
