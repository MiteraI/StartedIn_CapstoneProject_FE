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
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { catchError, throwError } from 'rxjs'
import { HttpErrorResponse } from '@angular/common/http'
import { RecruitInviteService } from 'src/app/services/recruit-invite.service'

@Component({
  selector: 'app-members-modal',
  templateUrl: './members-modal.component.html',
  styleUrls: ['./members-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzSelectModule, NzAvatarModule, InitialsOnlyPipe],
})
export class MembersModalComponent implements OnInit {
  members: TeamMemberModel[] = []
  emailsToInvite: string[] = []
  roleInTeam: TeamRole = TeamRole.MEMBER
  teamRoles = TeamRole
  teamRoleLabels = TeamRoleLabels

  constructor(private projectService: ProjectService, private recruitInviteService: RecruitInviteService  ,private notification: NzNotificationService, @Inject(NZ_MODAL_DATA) private projectId: string) {}

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
    const invites = this.emailsToInvite.map((email) => ({
      email: email.trim(),
      roleInTeam: this.roleInTeam,
    }))

    this.recruitInviteService
      .inviteMembers(this.projectId, invites)
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
}
