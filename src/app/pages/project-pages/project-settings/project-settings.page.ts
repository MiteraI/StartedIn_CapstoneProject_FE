import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloseProjectModalComponent } from 'src/app/components/project-pages/close-project-modal/close-project-modal.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { LeaveProjectModalComponent } from 'src/app/components/project-pages/leave-project-modal/leave-project-modal.component';
import { LeavingRequestListComponent } from 'src/app/components/project-pages/leaving-request-list/leaving-request-list.component';

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.page.html',
  styleUrls: ['./project-settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzSpinModule,
    LeavingRequestListComponent,
    RouterModule
  ]
})
export class ProjectSettingsPage implements OnInit {
  projectId!: string
  isLeader: boolean | null = null;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private roleService: RoleInTeamService
  ) { }

  ngOnInit() {
    this.projectId = this.route.parent?.snapshot.params['id'];
    this.roleService.role$.subscribe(role => {
      if (!role) {
        this.isLeader === null;
        return;
      }
      this.isLeader = role === TeamRole.LEADER;
    });
  }

  openCloseProjectModal() {
    this.modalService.create({
      nzTitle: 'Đóng dự án',
      nzContent: CloseProjectModalComponent,
      nzData: this.projectId,
      nzFooter: null
    });
  }

  openLeaveProjectModal() {
    this.modalService.create({
      nzTitle: 'Rời dự án',
      nzContent: LeaveProjectModalComponent,
      nzData: this.projectId,
      nzFooter: null
    });
  }
}
