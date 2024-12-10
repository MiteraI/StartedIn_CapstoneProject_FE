import { Component, OnDestroy, OnInit } from '@angular/core'
import { ProjectSideNavComponent } from 'src/app/layouts/project-side-nav/project-side-nav.component'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ActivatedRoute, RouterOutlet } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { ScrollService } from 'src/app/core/util/scroll.service'
import { ProjectTitleBarComponent } from 'src/app/layouts/project-title-bar/project-title-bar.component'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.page.html',
  styleUrls: ['./project-details.page.scss'],
  standalone: true,
  imports: [ProjectSideNavComponent, RouterOutlet, ProjectTitleBarComponent],
})
export class ProjectDetailsPage implements OnInit, OnDestroy {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()
  projectId = ''

  constructor(
    private viewMode: ViewModeConfigService,
    private route: ActivatedRoute,
    private scrollService: ScrollService,
    private roleInTeamService: RoleInTeamService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!
    this.viewMode.isDesktopView$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => (this.isDesktopView = val))
    this.roleInTeamService.fetchRole().subscribe();
  }

  ngOnDestroy() {
    this.roleInTeamService.clearRole();
    this.destroy$.next()
    this.destroy$.complete()
  }

  onScroll(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
      this.scrollService.emitScroll();
    }
  }
}
