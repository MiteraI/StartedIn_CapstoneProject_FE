import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { RecruitInviteService } from 'src/app/services/recruit-invite.service';
import { ApplicationType } from 'src/app/shared/enums/application-type.enum';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';

@Component({
  selector: 'app-project-invite-page',
  templateUrl: './project-invite-page.component.html',
  styleUrls: ['./project-invite-page.component.scss'],
  standalone: true,
})
export class ProjectInvitePage implements OnInit {
  projectId: string = '';
  role: any;
  projectOverview: any; // Property to store project invite overview data

  constructor(
    private recruitInviteService: RecruitInviteService,
    private route: ActivatedRoute,
    private antdNoti: AntdNotificationService
  ) {}

  inviteAccept() {
    if (this.role) {
      this.recruitInviteService.acceptProjectInvite({ role: this.role, type: ApplicationType.INVITE }, this.projectId).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Bạn đã chấp nhận lời mời dự án', '')
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

  ngOnInit() {
    this.projectId = this.route.snapshot.params['projectId'];
    this.role = TeamRole[this.route.snapshot.params['role'].toUpperCase()];

    this.recruitInviteService.getProjectInviteOverview(this.projectId).subscribe({
      next: (data) => {
        this.projectOverview = data;
        console.log('Project Overview:', this.projectOverview);
      },
      error: (error: HttpErrorResponse) => {
        this.antdNoti.openErrorNotification('Lỗi', 'Không thể tải dữ liệu lời mời dự án');
        console.error('Error fetching project invite overview:', error);
      },
    });
  }
}

