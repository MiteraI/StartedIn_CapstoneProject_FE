import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { ProjectApprovalService } from 'src/app/services/project-approval.service'
import { ProjectApprovalStatus, ProjectApprovalStatusLabel } from 'src/app/shared/enums/project-approval-status.enum'
import { ProjectApprovalDetail } from 'src/app/shared/models/project-approval/project-approval-detail.model'

@Component({
  selector: 'app-admin-approval-modal',
  templateUrl: './admin-approval-modal.component.html',
  styleUrls: ['./admin-approval-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, NzTagModule, NzPopoverModule, FormsModule, NzButtonModule, NzInputModule],
})
export class AdminApprovalModalComponent implements OnInit {
  //get data from nzdata
  readonly nzModalData = inject(NZ_MODAL_DATA)

  ProjectApprovalStatus = ProjectApprovalStatus
  ProjectApprovalStatusLabel = ProjectApprovalStatusLabel

  projectId: string = ''
  cancelReason: string = ''
  isModalVisible = false

  isAccepting = false
  approvalData: ProjectApprovalDetail
  constructor(private approvalService: ProjectApprovalService, private messageService: NzMessageService, private nzModalRef: NzModalRef) {
    this.approvalData = this.nzModalData.approval
  }

  ngOnInit() {
    console.log('approvalData:', this.approvalData)
    this.projectId = this.approvalData.documents[0].projectId
  }

  getStatusColor(status: ProjectApprovalStatus): string {
    switch (status) {
      case ProjectApprovalStatus.PENDING:
        return 'yellow'
      case ProjectApprovalStatus.ACCEPTED:
        return 'green'
      case ProjectApprovalStatus.REJECTED:
        return 'red'
      default:
        return 'gray'
    }
  }

  onCancel() {
    if (!this.cancelReason) {
      alert('Vui lòng nhập lý do hủy yêu cầu.')
      return
    }
    // Replace with your API call for cancellation
    this.approvalService.rejectProjectRequest(this.projectId, this.approvalData.id, this.cancelReason).subscribe({
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
    this.cancelReason = ''
    this.isModalVisible = false
  }

  acceptProjectApproval() {
    this.isAccepting = true
    this.approvalService.approveProjectRequest(this.projectId, this.approvalData.id).subscribe({
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
