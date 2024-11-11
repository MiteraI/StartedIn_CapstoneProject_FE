import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { IonContent } from '@ionic/angular/standalone'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { UserProjectCardComponent } from 'src/app/components/project-pages/project-list/project-card/project-card.component'
import { ExploreProjectsListItemModel } from 'src/app/shared/models/project/explore-projects-list-item.model'
import { CommonModule } from '@angular/common'
import { ProjectService } from 'src/app/services/project.service'
import { UserProjectsModel } from 'src/app/shared/models/project/user-projects.model'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { ProjectCreateModalComponent } from 'src/app/components/project-pages/project-create-modal/project-create-modal.component'

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.page.html',
  styleUrls: ['./project-list.page.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, UserProjectCardComponent, NzButtonModule, NzModalModule],
})
export class ProjectListPage implements OnInit {
  userProjects: UserProjectsModel | undefined
  ownProjects: ExploreProjectsListItemModel[] = []
  participatedProjects: ExploreProjectsListItemModel[] = []
  constructor(private projectService: ProjectService, private modalService: NzModalService, private cdr: ChangeDetectorRef, private route: ActivatedRoute) {}
  ngOnInit() {
    this.userProjects = this.route.snapshot.data['userProjects']
  }

  openCreateProjectModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Tạo Dự Án Mới',
      nzContent: ProjectCreateModalComponent,
      nzFooter: null,
    })
  }
}
