import { Component, Input, OnInit } from '@angular/core'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'
import { CommonModule } from '@angular/common'
import { ProjectModel } from 'src/app/shared/models/project/project.model'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  standalone: true,
  imports: [NzAvatarModule, InitialsOnlyPipe, CommonModule, RouterModule],
})
export class UserProjectCardComponent {
  @Input({ required: true }) project!: ProjectModel
  constructor() {}
}
