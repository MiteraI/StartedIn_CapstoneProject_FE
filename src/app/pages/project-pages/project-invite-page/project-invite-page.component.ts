import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AccountService } from 'src/app/core/auth/account.service';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { RecruitInviteService } from 'src/app/services/recruit-invite.service';
import { ApplicationType } from 'src/app/shared/enums/application-type.enum';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';

@Component({
  selector: 'app-project-invite-page',
  templateUrl: './project-invite-page.component.html',
  styleUrls: ['./project-invite-page.component.scss'],
  standalone: true,
  imports: [CommonModule, NzSpinModule],
})
export class ProjectInvitePage implements OnInit {
  projectId: string = '';
  role: any;
  projectOverview: any; // Property to store project invite overview data
  isAuthen: boolean = false;
  isLoading: boolean = true;

  constructor(
    private recruitInviteService: RecruitInviteService,
    private route: ActivatedRoute,
    private antdNoti: AntdNotificationService,
    private accountService: AccountService,
    private router: Router
  ) {}

  inviteAccept() {
    if (this.role) {
      this.recruitInviteService.acceptProjectInvite({ role: this.role, type: ApplicationType.INVITE }, this.projectId).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Bạn đã chấp nhận lời mời dự án', '')
          this.router.navigate(['/projects'])
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại sau')
          } else {
            console.error('', error)
          }
        },
      })
    }
  }

  redirectToLogin() {
    this.router.navigate(['/login'])
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.params['projectId'];
    this.role = TeamRole[this.route.snapshot.params['role'].toUpperCase()];
    this.accountService.isAuthenticated$.subscribe(data => this.isAuthen = data);
    this.isLoading = true;
    this.recruitInviteService.getProjectInviteOverview(this.projectId).subscribe({
      next: (data) => {
        this.projectOverview = data;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.antdNoti.openErrorNotification('Lỗi', 'Không thể tải dữ liệu lời mời dự án');
        this.isLoading = false;
      },
    });
  }
}

