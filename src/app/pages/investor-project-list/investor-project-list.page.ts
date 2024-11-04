import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProjectCardComponent } from 'src/app/components/investor-project-list/project-card/project-card.component';
import { InvestorProjectListItemModel } from 'src/app/shared/models/project/investor-project-list-item.model';
import sampleInvestorProjects from 'src/app/shared/sampledata/sample-investor-project-list-item';

@Component({
  selector: 'app-investor-project-list',
  standalone: true,
  imports: [ProjectCardComponent, CommonModule],
  templateUrl: 'investor-project-list.page.html',
  styleUrls: ['investor-project-list.page.scss']
})
export class InvestorProjectListPage {
  projects: InvestorProjectListItemModel[] = sampleInvestorProjects;
  totalProjects: number = this.projects.length;
}
