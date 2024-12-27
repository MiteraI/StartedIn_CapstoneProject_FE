import { CommonModule } from '@angular/common';
import { Component, inject, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ProjectApprovalService } from 'src/app/services/project-approval.service';
import { ProjectApprovalStatus, ProjectApprovalStatusLabel } from 'src/app/shared/enums/project-approval-status.enum';
import { ProjectApprovalDetail } from 'src/app/shared/models/project-approval/project-approval-detail.model';
import { VndCurrencyPipe } from "../../../shared/pipes/vnd-currency.pipe";
import { format } from 'date-fns';
import { CancelReasonForApproval } from 'src/app/shared/models/project-approval/project-approval-cancel.model';


@Component({
  selector: 'app-request-register-detail',
  templateUrl: './request-register-detail.component.html',
  styleUrls: ['./request-register-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzTagModule,
    NzPopoverModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    MatIconModule,
    VndCurrencyPipe,
],
})
export class RequestRegisterDetailComponent implements OnInit {
readonly nzModalData = inject(NZ_MODAL_DATA)

  ProjectApprovalStatus = ProjectApprovalStatus
  ProjectApprovalStatusLabel = ProjectApprovalStatusLabel

  projectId: string = ''
  cancelReason: CancelReasonForApproval = { cancelReason: '' }
  isModalVisible = false

  isAccepting = false
  approvalData: ProjectApprovalDetail
  constructor(
    private approvalService: ProjectApprovalService, 
    private messageService: NzMessageService, 
    private nzModalRef: NzModalRef) {
    this.approvalData = this.nzModalData.approval
  }

  ngOnInit() {
    console.log('approvalData:', this.approvalData)
    this.projectId = this.approvalData.documents[0].projectId
  }

  getStatusColor(status: ProjectApprovalStatus): string {
    switch (status) {
      case ProjectApprovalStatus.PENDING:
        return 'blue'
      case ProjectApprovalStatus.ACCEPTED:
        return 'green'
      case ProjectApprovalStatus.REJECTED:
        return 'red'
      default:
        return 'gray'
    }
  }
  
  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
  }

  onCancel() {
    if (!this.cancelReason) {
      alert('Vui lòng nhập lý do hủy yêu cầu.')
      return
    }
    // Replace with your API call for cancellation
    this.approvalService.rejectProjectRequest(this.approvalData.id, this.cancelReason).subscribe({
      next: () => {
        this.messageService.success('Hủy yêu cầu thành công')
        this.closePopover()
        this.nzModalRef.close()
      },
      error: (error) => {
        console.error('Error:', error)
        this.messageService.error(error.error)
      },
    })
    // Handle the response and close the modal
    this.isModalVisible = false
  }

  closePopover() {
    this.cancelReason = { cancelReason: '' }
    this.isModalVisible = false
  }

  acceptProjectApproval() {
    this.isAccepting = true
    this.approvalService.approveProjectRequest(this.approvalData.id).subscribe({
      next: () => {
        this.isAccepting = false
        this.isModalVisible = false
        this.messageService.success('Duyệt yêu cầu thành công')
        this.nzModalRef.close()
      },
      error: (error) => {
        console.error('Error:', error)
        this.isAccepting = false
        this.messageService.error(error.error)
      },
    })
    this.isModalVisible = false
  }
  
}
