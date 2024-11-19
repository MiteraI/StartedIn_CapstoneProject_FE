import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model'
import { ProjectOverviewService } from 'src/app/services/project-overview.service'

@Component({
  selector: 'app-project-description',
  templateUrl: './project-description.component.html',
  styleUrls: ['./project-description.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ProjectDescriptionComponent implements OnInit {
  projectOverview: ProjectOveriewModel | undefined
  constructor(private projectOverviewService: ProjectOverviewService) {}

  ngOnInit() {
    this.projectOverviewService.projectOverview$.subscribe((data) => {
      this.projectOverview = data
    })
  }
}
