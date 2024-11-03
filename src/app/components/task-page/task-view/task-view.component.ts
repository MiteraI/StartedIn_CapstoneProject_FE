import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component'

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  imports: [FilterBarComponent],
  styleUrls: ['./task-view.component.scss'],
  standalone: true,
})
export class TaskViewComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
