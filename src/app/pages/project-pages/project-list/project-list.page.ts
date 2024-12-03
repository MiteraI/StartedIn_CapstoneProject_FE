import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { UserProjectCardComponent } from 'src/app/components/project-pages/project-list/project-card/project-card.component'
import { CommonModule } from '@angular/common'
import { UserProjectsModel } from 'src/app/shared/models/project/user-projects.model'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { ProjectCreateModalComponent } from 'src/app/components/project-pages/project-create-modal/project-create-modal.component'
import { AccountService } from 'src/app/core/auth/account.service'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { ProjectService } from 'src/app/services/project.service'
import { Subject, switchMap, takeUntil } from 'rxjs'

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.page.html',
  styleUrls: ['./project-list.page.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, UserProjectCardComponent, NzButtonModule, NzModalModule, NzSpinModule],
})
export class ProjectListPage implements OnInit, OnDestroy {
  userProjects: UserProjectsModel | undefined
  isInvestor = true
  private destroy$ = new Subject<void>()

  constructor(
    private modalService: NzModalService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.userProjects = this.route.snapshot.data['userProjects']
    this.accountService.account$.pipe(takeUntil(this.destroy$)).subscribe((account) => {
      this.isInvestor = account?.authorities.includes('Investor') ?? false
    })
    this.projectService.refreshProject$.pipe(switchMap(() => this.projectService.getUserProjects())).subscribe((userProjects) => {
      this.userProjects = userProjects
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
    this.router.navigate(['/projects', id, this.isInvestor ? 'dashboard' : 'tasks'])
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
