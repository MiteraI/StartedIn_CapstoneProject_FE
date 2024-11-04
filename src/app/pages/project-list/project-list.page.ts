import { Component, OnInit } from '@angular/core'
import { IonContent } from '@ionic/angular/standalone'
import { RouterModule } from '@angular/router'
import { ProjectCardComponent } from 'src/app/components/investor-explore-projects/project-card/project-card.component'
import { ExploreProjectsListItemModel } from 'src/app/shared/models/project/explore-projects-list-item.model'
import sampleInvestorProjects from 'src/app/shared/sampledata/sample-investor-project-list-item'
import { CommonModule } from '@angular/common'
import { ProjectService } from 'src/app/services/project.service'
import { UserProjectsModel } from 'src/app/shared/models/project/user-projects.model'

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.page.html',
  styleUrls: ['./project-list.page.scss'],
  standalone: true,
  imports: [IonContent, RouterModule, ProjectCardComponent, CommonModule],
})
export class ProjectListPage implements OnInit {
  userProjects: UserProjectsModel | undefined
  ownProjects: ExploreProjectsListItemModel[] = []
  participatedProjects: ExploreProjectsListItemModel[] = []
  constructor(private projectService: ProjectService) {}
  ngOnInit() {
    this.projectService.getUserProjects().subscribe((userProjects: UserProjectsModel) => {
      this.userProjects = userProjects

      this.ownProjects = this.userProjects.listOwnProject.map((project) => ({
        ...project,
        leaderId: '1', // Add appropriate value
        leaderFullName: 'khoi kk', // Add appropriate value
      }))
      this.participatedProjects = this.userProjects.listParticipatedProject.map((project) => ({
        ...project,
        leaderId: '2', // Add appropriate value
        leaderFullName: 'Steve', // Add appropriate value
      }))
    })
  }
}
