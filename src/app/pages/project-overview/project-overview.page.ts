import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterOutlet, RouterModule, ActivatedRoute } from '@angular/router'
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model'
import { ProjectOverviewService } from 'src/app/services/project-overview.service'

@Component({
  selector: 'app-project-overview',
  templateUrl: './project-overview.page.html',
  styleUrls: ['./project-overview.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule],
})
export class ProjectOverviewPage implements OnInit {
  projectOverview: ProjectOveriewModel | undefined
  remainingAmount: number = 0
  constructor(private route: ActivatedRoute, private projectOverviewService: ProjectOverviewService) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.projectOverview = data['projectOverview']
      this.projectOverviewService.setProjectOverview(this.projectOverview)
      console.log(this.projectOverview)
      this.remainingAmount = this.projectOverview?.investmentCallResponseDto?.targetCall! - this.projectOverview?.investmentCallResponseDto?.amountRaised!
    })
  }
}
