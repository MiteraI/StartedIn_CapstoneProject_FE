import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { ProjectService } from 'src/app/services/project.service';
import { ShareEquityService } from 'src/app/services/share-equity.service';
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model';
import { ShareEquityItemModel } from 'src/app/shared/models/share-equity/share-equity-item.model';
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { format } from 'date-fns';
import { MatIconModule } from '@angular/material/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { LeaderTransferService } from 'src/app/services/leader-transfer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LeaderTransferModel } from 'src/app/shared/models/leader-transfer/leader-transfer.model';
import { catchError, throwError } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { MeetingStatus } from 'src/app/shared/enums/meeting-status.enum';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { TransferLeaderModalComponent } from 'src/app/components/project-pages/transfer-leader-modal/transfer-leader-modal.component';
import { TransferMeetingModalComponent } from 'src/app/components/project-pages/transfer-meeting-modal/transfer-meeting-modal.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzAvatarModule,
    NzInputModule,
    NzSelectModule,
    NzProgressModule,
    NzButtonModule,
    NzModalModule,
    NzSpinModule,
    InitialsOnlyPipe,
    MatIconModule,
    RouterModule
  ]
})
export class MembersPage implements OnInit {
  projectId!: string;
  members: TeamMemberModel[] = [];
  equities: ShareEquityItemModel[] = [];
  fullList: (TeamMemberModel & { equity: number })[] = [];
  filteredList: (TeamMemberModel & { equity: number })[] = [];

  searchText: string = '';
  roleFilter: 'all' | 'member' | 'mentor' | 'investor' = 'all';
  sortBy: 'name' | 'email' | 'role' | 'equity' = 'name';
  ascending: boolean = true;

  teamRoles = TeamRole;
  teamRoleLabels = TeamRoleLabels;

  leaderTransfer?: LeaderTransferModel;
  isLeader: boolean = false;
  meetingStatus = MeetingStatus;

  isMembersLoading = true;
  isTransferLoading = true;

  constructor(
    private projectService: ProjectService,
    private shareEquityService: ShareEquityService,
    private leaderTransferService: LeaderTransferService,
    private roleService: RoleInTeamService,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => {
      if (!params.get('id')) return;
      this.projectId = params.get('id')!;
      this.loadMembers();
    });
    this.roleService.role$.subscribe(role => {
      this.isLeader = role === TeamRole.LEADER;
      if (this.isLeader) this.loadTransfer();
    });
  }

  private loadTransfer() {
    this.isTransferLoading = true;
    this.leaderTransferService
      .getLatest(this.projectId)
      .pipe(
        catchError(error => {
          if (error.status !== 404 && error.status !== 401) {
            this.notification.error('Lỗi', 'Không thể tải thông tin nhượng quyền nhóm trưởng!', { nzDuration: 2000 });
          }
          this.isTransferLoading = false;
          return throwError(() => error);
        })
      )
      .subscribe(response => {
        this.leaderTransfer = response;
        this.isTransferLoading = false;
      });
  }

  private loadMembers() {
    this.isMembersLoading = true;
    this.projectService
      .getMembers(this.projectId)
      .pipe(
        catchError(error => {
          this.notification.error('Lỗi', 'Không thể tải danh sách thành viên!', { nzDuration: 2000 });
          this.isMembersLoading = false;
          return throwError(() => error);
        })
      )
      .subscribe(members => {
        this.members = members;
        this.loadEquities();
      });
  }

  private loadEquities() {
    const formattedDate = format(new Date(), 'yyyy-MM-dd');
    this.shareEquityService
      .getEquities(this.projectId, formattedDate)
      .pipe(
        catchError(error => {
          this.notification.error('Lỗi', 'Không thể tải thông tin cổ phần!', { nzDuration: 2000 });
          this.isMembersLoading = false;
          return throwError(() => error);
        })
      )
      .subscribe(equities => {
        this.equities = equities;
        this.combineData();
        this.isMembersLoading = false;
      });
  }

  private combineData() {
    this.fullList = this.members.map(member => ({
      ...member,
      equity: this.equities.find(e => e.userId === member.id)?.percentage || 0
    }));
    this.applyFilters();
  }

  applyFilters() {
    this.filteredList = [...this.fullList];

    if (this.roleFilter === 'member') {
      this.filteredList = this.filteredList.filter(member =>
        member.roleInTeam === TeamRole.LEADER ||
        member.roleInTeam === TeamRole.MEMBER
      );
    } else if (this.roleFilter === 'mentor') {
      this.filteredList = this.filteredList.filter(member => member.roleInTeam === TeamRole.MENTOR);
    } else if (this.roleFilter === 'investor') {
      this.filteredList = this.filteredList.filter(member => member.roleInTeam === TeamRole.INVESTOR);
    }

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      this.filteredList = this.filteredList.filter(member =>
        member.fullName.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search)
      );
    }

    this.filteredList.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.roleInTeam - b.roleInTeam;
          break;
        case 'equity':
          comparison = a.equity - b.equity;
          break;
      }
      return this.ascending ? comparison : -comparison;
    });
  }

  toggleSort(field: 'name' | 'email' | 'role' | 'equity') {
    if (this.sortBy === field) {
      this.ascending = !this.ascending;
    } else {
      this.sortBy = field;
      this.ascending = true;
    }
    this.applyFilters();
  }

  openTransferMeetingModal() {
    this.modalService.create({
      nzTitle: 'Tạo cuộc họp chuyển giao',
      nzContent: TransferMeetingModalComponent,
      nzData: { projectId: this.projectId },
      nzFooter: null,
      nzWidth: 600
    }).afterClose.subscribe(result => {
      if (result) {
        this.loadMembers();
        this.loadTransfer();
      }
    });
  }

  openTransferLeaderModal() {
    const nonLeaderMembers = this.members.filter(m => m.roleInTeam === TeamRole.MEMBER);

    this.modalService.create({
      nzTitle: 'Chuyển giao quyền nhóm trưởng',
      nzContent: TransferLeaderModalComponent,
      nzData: {
        projectId: this.projectId,
        requestId: this.leaderTransfer!.id,
        members: nonLeaderMembers
      },
      nzFooter: null,
      nzWidth: 500
    }).afterClose.subscribe(result => {
      if (result) {
        this.loadMembers();
        this.leaderTransfer = undefined;
        this.loadTransfer();
      }
    });
  }

  cancelTransfer() {
    this.modalService.confirm({
      nzTitle: 'Hủy chuyển giao',
      nzContent: 'Bạn có chắc chắn muốn hủy yêu cầu chuyển giao quyền nhóm trưởng?',
      nzOkText: 'Hủy yêu cầu',
      nzCancelText: 'Đóng',
      nzOkDanger: true,
      nzOnOk: () => {
        this.leaderTransferService
          .cancel(this.projectId, this.leaderTransfer!.id)
          .pipe(
            catchError(error => {
              this.notification.error('Lỗi', 'Hủy chuyển giao thất bại!', { nzDuration: 2000 });
              return throwError(() => error);
            })
          )
          .subscribe(() => {
            this.notification.success('Thành công', 'Đã hủy yêu cầu chuyển giao', { nzDuration: 2000 });
            this.loadMembers();
            this.leaderTransfer = undefined;
            this.loadTransfer();
          });
      }
    });
  }
}
