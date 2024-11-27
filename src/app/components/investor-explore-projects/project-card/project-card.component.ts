import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'
import { ExploreProjectsListItemModel } from 'src/app/shared/models/project/explore-projects-list-item.model'

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, NzAvatarModule, InitialsOnlyPipe, RouterModule],
  templateUrl: 'project-card.component.html',
  styleUrls: ['project-card.component.scss'],
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: ExploreProjectsListItemModel

  constructor(private router: Router) {}
}
