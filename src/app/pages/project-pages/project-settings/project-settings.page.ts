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
import { ProjectService } from 'src/app/services/project.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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
    NzInputModule,
    LeavingRequestListComponent,
    RouterModule,
    MatIconModule,
    FormsModule
  ]
})
export class ProjectSettingsPage implements OnInit {
  projectId!: string
  isLeader: boolean | null = null;
  defaultMeetingUrl: string = '';
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private roleService: RoleInTeamService,
    private projectService: ProjectService,
    private notification: NzNotificationService
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
    this.loadDefaultMeetingUrl();
  }

  loadDefaultMeetingUrl() {
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.defaultMeetingUrl = project.appointmentUrl || '';
      },
      error: (error) => {
        this.notification.error('Lỗi', error.error || 'Không thể tải link cuộc họp mặc định!', { nzDuration: 2000 });
      }
    });
  }

  setDefaultMeetingUrl() {
    if (!this.defaultMeetingUrl) return;

    this.isSubmitting = true;
    this.projectService.setAppointmentUrl(this.projectId, this.defaultMeetingUrl).subscribe({
      next: () => {
        this.notification.success('Thành công', 'Đã cập nhật link cuộc họp mặc định!', { nzDuration: 2000 });
        this.isSubmitting = false;
      },
      error: (error) => {
        this.notification.error('Lỗi', 'Không thể cập nhật link cuộc họp mặc định!', { nzDuration: 2000 });
        this.isSubmitting = false;
      }
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
