import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { UserProjectCardComponent } from 'src/app/components/project-pages/project-list/project-card/project-card.component'
import { ExploreProjectsListItemModel } from 'src/app/shared/models/project/explore-projects-list-item.model'
import { CommonModule } from '@angular/common'
import { UserProjectsModel } from 'src/app/shared/models/project/user-projects.model'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { ProjectCreateModalComponent } from 'src/app/components/project-pages/project-create-modal/project-create-modal.component'
import { AccountService } from 'src/app/core/auth/account.service'

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.page.html',
  styleUrls: ['./project-list.page.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, UserProjectCardComponent, NzButtonModule, NzModalModule],
})
export class ProjectListPage implements OnInit {
  userProjects: UserProjectsModel | undefined;
  ownProjects: ExploreProjectsListItemModel[] = [];
  participatedProjects: ExploreProjectsListItemModel[] = [];

  isInvestor = true;

  constructor(
    private modalService: NzModalService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userProjects = this.route.snapshot.data['userProjects'];
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.isInvestor = account.authorities.includes('Investor');
      }
    })
  }

  openCreateProjectModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Tạo Dự Án Mới',
      nzContent: ProjectCreateModalComponent,
      nzFooter: null,
    })
  }

  navigateToProject(id: string) {
    console.log(this.isInvestor);

    this.router.navigate(['/projects', id, this.isInvestor ? 'charter' : 'tasks']);
  }
}
