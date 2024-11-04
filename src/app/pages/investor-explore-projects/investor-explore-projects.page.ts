import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProjectCardComponent } from 'src/app/components/investor-explore-projects/project-card/project-card.component';
import { ExploreProjectsListItemModel } from 'src/app/shared/models/project/explore-projects-list-item.model';
import sampleInvestorProjects from 'src/app/shared/sampledata/sample-investor-project-list-item';

@Component({
  selector: 'app-investor-explore-projects',
  standalone: true,
  imports: [ProjectCardComponent, CommonModule],
  templateUrl: 'investor-explore-projects.page.html',
  styleUrls: ['investor-explore-projects.page.scss']
})
export class InvestorExploreProjectsPage {
  projects: ExploreProjectsListItemModel[] = sampleInvestorProjects;
  totalProjects: number = this.projects.length;
}
