import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'
import { IonIcon } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { cashOutline } from 'ionicons/icons'
import { ExploreProjectsListItemModel } from 'src/app/shared/models/project/explore-projects-list-item.model'

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, NzAvatarModule, InitialsOnlyPipe, IonIcon],
  templateUrl: 'project-card.component.html',
  styleUrls: ['project-card.component.scss'],
})
export class ProjectCardComponent implements OnInit {
  @Input({ required: true }) project!: ExploreProjectsListItemModel

  constructor(private router: Router) {
    addIcons({ cashOutline })
  }

  ngOnInit() {}

  navigateToCreateDealOffer() {
    this.router.navigate(['/projects', this.project.id, 'create-deal-offer'])
  }
}
