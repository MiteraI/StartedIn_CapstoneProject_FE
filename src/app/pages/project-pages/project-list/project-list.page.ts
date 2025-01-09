import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { UserProjectCardComponent } from 'src/app/components/project-pages/project-list/project-card/project-card.component'
import { CommonModule } from '@angular/common'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { ProjectCreateModalComponent } from 'src/app/components/project-pages/project-create-modal/project-create-modal.component'
import { AccountService } from 'src/app/core/auth/account.service'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { ProjectService } from 'src/app/services/project.service'
import { Subject, switchMap, takeUntil, tap } from 'rxjs'
import { Authority } from 'src/app/shared/constants/authority.constants'
import { ProjectModel } from 'src/app/shared/models/project/project.model'
import { UserStatusInProject, UserStatusInProjectLabels } from 'src/app/shared/enums/user-in-project-status.enum'
import { ProjectStatus } from 'src/app/shared/enums/project-status.enum'
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification'

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.page.html',
  styleUrls: ['./project-list.page.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, UserProjectCardComponent, NzButtonModule, NzModalModule, NzSpinModule, NzNotificationModule],
})
export class ProjectListPage implements OnInit, OnDestroy {
  userProjects: ProjectModel[] | undefined
  participatedProjects: ProjectModel[] = []
  leftProjects: ProjectModel[] = []
  isInvestor = true
  isMentor = true
  loading = false
  private destroy$ = new Subject<void>()

  constructor(
    private modalService: NzModalService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private router: Router,
    private projectService: ProjectService,
    private notification: NzNotificationService
  ) {}

  ProjectStatus = ProjectStatus
  UserStatusInProject = UserStatusInProject

  ngOnInit() {
    // Load initial user projects from route data
    this.userProjects = this.route.snapshot.data['userProjects']

    // Subscribe to account changes
    this.accountService.account$.pipe(takeUntil(this.destroy$)).subscribe((account) => {
      this.isInvestor = account?.authorities.includes(Authority.INVESTOR) ?? false
      this.isMentor = account?.authorities.includes(Authority.MENTOR) ?? false
    })

    // Refresh projects when triggered
    this.projectService.refreshProject$
      .pipe(
        tap(() => (this.loading = true)),
        switchMap(() => this.projectService.getUserProjects()),
        takeUntil(this.destroy$)
      )
      .subscribe((userProjects) => {
        this.userProjects = userProjects
        this.updateProjectLists()
      })
  }

  // Update participated and left projects
  private updateProjectLists() {
    this.participatedProjects = this.userProjects?.filter((project) => project.userStatusInProject === UserStatusInProject.ACTIVE) || []
    this.leftProjects = this.userProjects?.filter((project) => project.userStatusInProject === UserStatusInProject.LEFT) || []
    this.loading = false
  }

  // Handle project click events
  onProjectClick(project: ProjectModel) {
    if (project.projectStatus === ProjectStatus.CLOSED || project.userStatusInProject === UserStatusInProject.LEFT) {
      this.showProjectClosedOrLeftNotification()
    } else {
      this.navigateToProject(project.id)
    }
  }

  // Show notification for closed or left projects
  showProjectClosedOrLeftNotification() {
    this.notification.warning('Thông báo', 'Bạn đã rời dự án này')
  }

  // Open the create project modal
  openCreateProjectModal() {
    this.modalService.create({
      nzContent: ProjectCreateModalComponent,
      nzStyle: { top: '20px', width: '700px' },
      nzFooter: null,
    })
  }

  // Navigate to the project dashboard
  navigateToProject(id: string) {
    this.router.navigate(['/projects', id, 'dashboard'])
  }

  // Cleanup subscriptions
  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
