import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TerminationRequestService } from 'src/app/services/termination-request.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TerminationRequestModel } from 'src/app/shared/models/termination-request/termination-request.model';
import { differenceInDays } from 'date-fns'
import { TerminationRequestDetailModalComponent } from 'src/app/components/contract-pages/termination-request-detail-modal/termination-request-detail-modal.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TerminateContractModalComponent } from 'src/app/components/contract-pages/terminate-contract-modal/terminate-contract-modal.component';

@Component({
  selector: 'app-termination-requests',
  templateUrl: './termination-requests.page.html',
  styleUrls: ['./termination-requests.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    NzSpinModule,
    NzModalModule,
    NzButtonModule,
    MatIconModule
  ]
})
export class TerminationRequestsPage implements OnInit, OnDestroy {
  projectId!: string;
  isLeader: boolean = true;
  isLoading: boolean = true;
  requests: TerminationRequestModel[] = [];
  filteredRequests: TerminationRequestModel[] = [];
  filterMode: number = 1;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private roleService: RoleInTeamService,
    private terminationRequestService: TerminationRequestService,
    private modalService: NzModalService,
    private notification: NzNotificationService
  ) { }

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(map => this.projectId = map.get('id')!);
    this.roleService.role$.subscribe(role => {
      if (!role) return;
      this.isLeader = role === TeamRole.LEADER;
      if (this.isLeader) {
        this.loadReceivedRequests();
      } else {
        this.loadSentRequests();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSentRequests() {
    this.isLoading = true;
    this.terminationRequestService.getSentList(this.projectId).subscribe({
      next: (response) => {
        this.requests = response;
        this.filter();
        this.isLoading = false;
      },
      error: (error) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách yêu cầu', { nzDuration: 2000 });
        this.isLoading = false;
      }
    });
  }

  loadReceivedRequests() {
    this.isLoading = true;
    this.terminationRequestService.getReceivedList(this.projectId).subscribe({
      next: (response) => {
        this.requests = response;
        this.filteredRequests = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách yêu cầu', { nzDuration: 2000 });
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    this.modalService.create({
      nzTitle: 'Kết thúc hợp đồng',
      nzContent: TerminateContractModalComponent,
      nzData: { projectId: this.projectId },
      nzFooter: null
    });
  }

  filter() {
    this.filteredRequests = this.requests.filter(request => {
      if (this.filterMode === 1 && differenceInDays(new Date(), new Date(request.createdTime)) > 7) {
        return false;
      } else if (this.filterMode === 2 && differenceInDays(new Date(), new Date(request.createdTime)) > 30) {
        return false;
      }
      return true;
    })
  }

  showRequestDetail(request: TerminationRequestModel) {
    this.modalService.create({
      nzTitle: 'Chi tiết yêu cầu kết thúc hợp đồng',
      nzContent: TerminationRequestDetailModalComponent,
      nzFooter: null,
      nzData: {
        projectId: this.projectId,
        isLeader: this.isLeader,
        request: request
      },
      nzStyle: { width: '700px' }
    });
  }

  acceptRequest(request: TerminationRequestModel) {
    this.modalService.confirm({
      nzTitle: `Chấp nhận yêu cầu của ${request.fromName}?`,
      nzContent: `Lý do kết thúc hợp đồng: ${request.reason}`,
      nzClosable: false,
      nzMaskClosable: true,
      nzOkText: 'Chấp nhận',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.terminationRequestService.accept(this.projectId, request.id).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Đã chấp nhận yêu cầu kết thúc hợp đồng', { nzDuration: 2000 });
            this.loadReceivedRequests();
          },
          error: () => {
            this.notification.error('Lỗi', 'Không thể chấp nhận yêu cầu kết thúc hợp đồng', { nzDuration: 2000 });
          }
        });
      }
    });
  }

  rejectRequest(request: TerminationRequestModel) {
    this.modalService.confirm({
      nzTitle: `Từ chối yêu cầu của ${request.fromName}?`,
      nzContent: `Lý do kết thúc hợp đồng: ${request.reason}`,
      nzClosable: false,
      nzMaskClosable: true,
      nzOkText: 'Từ chối',
      nzOkDanger: true,
      nzOnOk: () => {
        this.terminationRequestService.reject(this.projectId, request.id).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Đã từ chối yêu cầu kết thúc hợp đồng', { nzDuration: 2000 });
            this.loadReceivedRequests();
          },
          error: () => {
            this.notification.error('Lỗi', 'Không thể từ chối yêu cầu kết thúc hợp đồng', { nzDuration: 2000 });
          }
        });
      }
    });
  }
}
