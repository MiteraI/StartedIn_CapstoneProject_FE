import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule, ActivatedRoute } from '@angular/router'
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model'
import { ProjectOverviewService } from 'src/app/services/project-overview.service'
import { ProjectCharterComponent } from 'src/app/components/project-pages/project-overview/project-charter/project-charter.component'

@Component({
  selector: 'app-project-overview',
  templateUrl: './project-overview.page.html',
  styleUrls: ['./project-overview.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProjectCharterComponent],
})
export class ProjectOverviewPage {
  projectId = ''
  projectOverview: ProjectOveriewModel | undefined

  currentSelectedTab = 0
  constructor(private route: ActivatedRoute, private projectOverviewService: ProjectOverviewService) {
    this.route.data.subscribe((data) => {
      this.projectOverview = data['projectOverview']
      this.projectOverviewService.setProjectOverview(this.projectOverview)
    })

    //get project id from route
    this.route.paramMap.subscribe((params) => {
      this.projectId = params.get('projectId')!
    })
  }
}
