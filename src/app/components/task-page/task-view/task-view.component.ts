import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss'],
  standalone: true,
})
export class TaskViewComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  navigateToHome() {
    this.router.navigate([''])
  }
}
