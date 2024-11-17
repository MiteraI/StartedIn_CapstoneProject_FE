import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterOutlet, RouterModule } from '@angular/router'

@Component({
  selector: 'app-project-overview',
  templateUrl: './project-overview.page.html',
  styleUrls: ['./project-overview.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule],
})
export class ProjectOverviewPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
