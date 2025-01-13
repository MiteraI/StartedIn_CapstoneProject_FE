import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatIcon, MatIconModule } from '@angular/material/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { ProjectApprovalService } from 'src/app/services/project-approval.service'
import { ProjectApprovalStatus, ProjectApprovalStatusLabel } from 'src/app/shared/enums/project-approval-status.enum'
import { ProjectApprovalDetail } from 'src/app/shared/models/project-approval/project-approval-detail.model'
import { VndCurrencyPipe } from '../../../shared/pipes/vnd-currency.pipe'
import { format } from 'date-fns'
import { Router, RouterModule } from '@angular/router'
import { CancelReasonForApproval } from 'src/app/shared/models/project-approval/project-approval-cancel.model'

@Component({
  selector: 'app-admin-approval-modal',
  templateUrl: './admin-approval-modal.component.html',
  styleUrls: ['./admin-approval-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, NzTagModule, NzPopoverModule, FormsModule, NzButtonModule, NzInputModule, MatIconModule, VndCurrencyPipe, RouterModule],
})
export class AdminApprovalModalComponent implements OnInit {
  //get data from nzdata
  readonly nzModalData = inject(NZ_MODAL_DATA)

  ProjectApprovalStatus = ProjectApprovalStatus
  ProjectApprovalStatusLabel = ProjectApprovalStatusLabel

  projectId: string = ''
  cancelReason: CancelReasonForApproval = { cancelReason: '' }
  isModalVisible = false

  isAccepting = false
  approvalData: ProjectApprovalDetail
  constructor(private approvalService: ProjectApprovalService, private messageService: NzMessageService, private nzModalRef: NzModalRef, private router: Router) {
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

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm')
  }

  onCancel() {
    // The validation is now handled by the form template, so we don't need the alert
    this.approvalService.rejectProjectRequest(this.approvalData.id, this.cancelReason).subscribe({
      next: () => {
        this.messageService.success('Hủy yêu cầu thành công')
        this.cancelReason = { cancelReason: '' } // Reset the reason
        this.isModalVisible = false // Close the popover
        this.approvalService.refreshApproval$.next(true)
        this.nzModalRef.close({ approve: false })
      },
      error: (error) => {
        console.error('Error:', error)
        this.messageService.error(error.error)
        this.approvalService.refreshApproval$.next(true)
      },
    })
  }

  closePopover() {
    this.cancelReason = { cancelReason: '' } // Reset the reason when closing
    this.isModalVisible = false
  }

  acceptProjectApproval() {
    this.isAccepting = true
    this.approvalService.approveProjectRequest(this.approvalData.id).subscribe({
      next: () => {
        this.isAccepting = false
        this.isModalVisible = false
        this.approvalService.refreshApproval$.next(true)
        this.messageService.success('Duyệt yêu cầu thành công')
        this.nzModalRef.close({ approve: true })
      },
      error: (error) => {
        console.error('Error:', error)
        this.isAccepting = false
        this.approvalService.refreshApproval$.next(true)
        this.messageService.error(error.error)
      },
    })
    this.isModalVisible = false
  }

  navigateToProjectDetail(projectId: string | undefined): void {
    if (projectId) {
      this.nzModalRef.close()
      this.router.navigate(['/admin/projects', projectId])
    } else {
      console.warn('Project ID is missing. Unable to navigate.')
    }
  }
}
