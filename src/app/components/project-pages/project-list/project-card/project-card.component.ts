import { Component, Input, OnInit } from '@angular/core'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'
import { CommonModule } from '@angular/common'
import { ProjectModel } from 'src/app/shared/models/project/project.model'
import { RouterModule } from '@angular/router'
import { UserStatusInProject, UserStatusInProjectLabels } from 'src/app/shared/enums/user-in-project-status.enum'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { ProjectStatus, ProjectStatusLabels } from 'src/app/shared/enums/project-status.enum'

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  standalone: true,
  imports: [NzAvatarModule, InitialsOnlyPipe, CommonModule, RouterModule, NzTagModule],
})
export class UserProjectCardComponent {
  @Input({ required: true }) project!: ProjectModel

  UserStatusInProject = UserStatusInProject
  UserStatusInProjectLabel = UserStatusInProjectLabels
  ProjectStatus = ProjectStatus
  ProjectStatusLabel = ProjectStatusLabels

  constructor() {}

  getProjectStatusLabel(type: ProjectStatus): string {
    return ProjectStatusLabels[type]
  }
  
  getUserStatusLabelStatusLabel(type: UserStatusInProject): string {
    return UserStatusInProjectLabels[type]
  }

  getUserProjectStatusColor(status: UserStatusInProject): string {
      switch (status) {
        case UserStatusInProject.ACTIVE:
          return 'green'
        case UserStatusInProject.LEFT:
          return 'red'
        default:
          return 'gray'
      }
  }

  getProjectStatusColor(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.CONSTRUCTING:
        return 'orange';
      case ProjectStatus.ACTIVE:
        return 'green';
      case ProjectStatus.CLOSED:
        return 'red';
      default:
        return 'gray'; // Default color if status doesn't match
    }
  }
}
