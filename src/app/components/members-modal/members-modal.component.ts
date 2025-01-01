import { Component, OnInit, Inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { catchError, finalize, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { RecruitInviteService } from 'src/app/services/recruit-invite.service'
import { Router } from '@angular/router'
import { PendingInvitationModel } from 'src/app/shared/models/recruit-invite/pending-invitation.model'
import { NzSpinModule } from 'ng-zorro-antd/spin'

@Component({
  selector: 'app-members-modal',
  templateUrl: './members-modal.component.html',
  styleUrls: ['./members-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzSelectModule,
    NzAvatarModule,
    NzSpinModule,
    InitialsOnlyPipe
  ],
})
export class MembersModalComponent implements OnInit {
  invitations: PendingInvitationModel[] = [];
  emailsToInvite: string[] = [];
  teamRoles = TeamRole;
  teamRoleLabels = TeamRoleLabels;
  isLoading = true;
  isSubmitting = false;

  constructor(
    private modal: NzModalRef,
    private recruitInviteService: RecruitInviteService,
    private notification: NzNotificationService,
    @Inject(NZ_MODAL_DATA) private projectId: string,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInvitations();
  }

  private loadInvitations() {
    this.isLoading = true;
    this.recruitInviteService
      .getPendingInvitations(this.projectId)
      .pipe(
        finalize(() => this.isLoading = false),
        catchError((error) => {
          this.notification.error('Lỗi', error.error || 'Lấy danh sách lời mời đang chờ thất bại!', { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(invitations => this.invitations = invitations);
  }

  inviteMembers() {
    this.isSubmitting = true;
    this.recruitInviteService
      .inviteMembers(this.projectId, this.emailsToInvite)
      .pipe(
        finalize(() => this.isSubmitting = false),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.notification.error('Lỗi', error.error, { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          } else {
            this.notification.error('Lỗi', 'Lỗi hệ thống, vui lòng thử lại sau!', { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          }
        })
      )
      .subscribe(response => {
        this.notification.success('Thành công', 'Đã gửi lời mời thành công');
        this.emailsToInvite = [];
        this.loadInvitations();
      })
  }

  navigateToUser(userId: string) {
    this.modal.close();
    this.router.navigate(['/users', userId])
  }
}
