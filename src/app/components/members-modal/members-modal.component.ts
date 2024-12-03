import { Component, OnInit, Inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { ProjectService } from 'src/app/services/project.service'
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model'
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { catchError, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { RecruitInviteService } from 'src/app/services/recruit-invite.service'
import { Router } from '@angular/router'

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
    InitialsOnlyPipe
  ],
})
export class MembersModalComponent implements OnInit {
  members: TeamMemberModel[] = []
  emailsToInvite: string[] = []
  teamRoles = TeamRole
  teamRoleLabels = TeamRoleLabels

  constructor(
    private modal: NzModalRef,
    private projectService: ProjectService,
    private recruitInviteService: RecruitInviteService,
    private notification: NzNotificationService,
    @Inject(NZ_MODAL_DATA) private projectId: string,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMembers()
  }

  private loadMembers() {
    this.projectService
      .getMembers(this.projectId)
      .pipe(
        catchError((error) => {
          this.notification.error('Lỗi', 'Lấy danh sách thành viên thất bại!', { nzDuration: 2000 })
          return throwError(() => new Error(error.error))
        })
      )
      .subscribe((members) => (this.members = members))
  }

  inviteMembers() {
    this.recruitInviteService
      .inviteMembers(this.projectId, this.emailsToInvite)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.notification.error('Lỗi', error.error, { nzDuration: 2000 })
            return throwError(() => new Error(error.error))
          }  else {
            this.notification.error('Lỗi', 'Lỗi hệ thống, vui lòng thử lại sau!', { nzDuration: 2000 })
            return throwError(() => new Error(error.error))
          }
        })
      )
      .subscribe((response) => {
        this.notification.success('Thành công', 'Đã gửi lời mời thành công')
        this.emailsToInvite = []
        this.loadMembers()
      })
  }

  navigateToUser(userId: string) {
    this.modal.close();
    this.router.navigate(['/users', userId])
  }
}
