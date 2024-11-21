import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service';
import { ScrollService } from 'src/app/core/util/scroll.service';
import { catchError, throwError } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum';
import { InitialsOnlyPipe } from "../../../shared/pipes/initials-only.pipe";

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.page.html',
  styleUrls: ['./member-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    InitialsOnlyPipe
]
})
export class MemberListPage implements OnInit {

  projectId!: string;
  members: TeamMemberModel[] = [];

  teamRoles = TeamRole;
  teamRoleLabels = TeamRoleLabels;

  isLoading = false;
  isDesktopView = false;
  isLeader = false;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() : void{
    this.route.parent?.paramMap.subscribe(map => {
      if(!map.get("id"))
      {
        return;        
      }
      this.projectId = map.get('id')!;
      this.getMemberList();
    })
  }
  getMemberList(){
      this.projectService
      .getMembers(this.projectId)
      .pipe(
          catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách thành viên thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.members = result;
      });  
  }
}
