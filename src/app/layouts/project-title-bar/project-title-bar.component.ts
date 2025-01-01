import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { catchError, Subject, takeUntil, throwError } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ProfileDropdownComponent } from '../profile-dropdown/profile-dropdown.component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { CommonModule, Location } from '@angular/common'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { MembersModalComponent } from 'src/app/components/members-modal/members-modal.component'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { ProjectModel } from 'src/app/shared/models/project/project.model'
import { ProjectService } from 'src/app/services/project.service'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'

@Component({
  selector: 'app-project-title-bar',
  standalone: true,
  imports: [
    MatIconModule,
    ProfileDropdownComponent,
    NzButtonModule,
    CommonModule,
    NzModalModule,
    RouterModule
  ],
  templateUrl: './project-title-bar.component.html',
  styleUrls: ['./project-title-bar.component.scss'],
})
export class ProjectTitleBarComponent implements OnInit, OnDestroy {
  project: ProjectModel | null = null;
  isDesktopView: boolean = false;
  isLeader: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private viewMode: ViewModeConfigService,
    private location: Location,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private roleService: RoleInTeamService,
  ) {}

  ngOnInit() {
    this.viewMode.isDesktopView$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => (this.isDesktopView = val));
    this.roleService.role$.subscribe(role => {
      this.isLeader = role === TeamRole.LEADER;
    });
    this.route.paramMap.subscribe(map => {
      if (!map.get('id')) {
        return;
      };

      this.projectService
        .getProject(map.get('id')!)
        .pipe(
          catchError(error => {
            this.notification.error("Lỗi", "Lấy thông tin dự án thất bại!", { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(response => this.project = response);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateBack() {
    this.location.back();
  }

  openMembersModal() {
    this.modal.create({
      nzFooter: null,
      nzWidth: 600,
      nzContent: MembersModalComponent,
      nzClassName: 'members-modal',
      nzData: this.project!.id
    });
  }
}
