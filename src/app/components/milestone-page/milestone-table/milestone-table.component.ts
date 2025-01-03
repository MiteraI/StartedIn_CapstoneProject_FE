import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzModalService } from 'ng-zorro-antd/modal'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzTableModule } from 'ng-zorro-antd/table'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { UpdateMilestoneModalComponent } from '../update-milestone-modal/update-milestone-modal.component'
import { MilestoneService } from 'src/app/services/milestone.service'
import { HttpErrorResponse } from '@angular/common/http'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { format } from 'date-fns';
import { RouterLink } from '@angular/router'
import { NzIconModule } from 'ng-zorro-antd/icon'

@Component({
  selector: 'app-milestone-table',
  templateUrl: './milestone-table.component.html',
  styleUrls: ['./milestone-table.component.scss'],
  standalone: true,
  imports: [CommonModule, NzTableModule, NzDividerModule, NzButtonModule, NzPopconfirmModule, NzProgressModule, RouterLink, NzIconModule],
})
export class MilestoneTableComponent {
  @Output() pageChanged = new EventEmitter<number>()
  @Input({ required: true }) milestoneList: Milestone[] = []
  @Input({ required: true }) projectId: string = ''
  @Input({ required: true }) isFetchAllTaskLoading: boolean = false
  @Input() isLeader: boolean = false
  @Input() total: number = 0
  @Input() size: number = 10
  @Input() page: number = 1

  expandSet = new Set<string>()
  onExpandChange(id: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id)
    } else {
      this.expandSet.delete(id)
    }
  }

  constructor(private modalService: NzModalService, private milestoneService: MilestoneService, private antdNoti: AntdNotificationService) {}

  openUpdateMilestoneModal(milestoneId: string) {
    const modalRef = this.modalService.create({
      nzTitle: 'Thông Tin Cột Mốc',
      nzStyle: { top: '20px', maxWidth: '800px' },
      nzBodyStyle: { padding: '0px' },
      nzWidth: '90vw',
      nzContent: UpdateMilestoneModalComponent,
      nzData: {
        milestoneId: milestoneId,
        projectId: this.projectId,
      },
      nzFooter: null,
    })
  }

  handleDeleteMilestone(milestoneId: string) {
    this.milestoneService.deleteMilestone(this.projectId, milestoneId).subscribe({
      next: (response) => {
        this.antdNoti.openSuccessNotification('Xóa Cột Mốc Thành Công', '')
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
          console.error('', error)
        }
      },
    })
  }

  onPageChange(page: number) {
    this.pageChanged.emit(page)
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy')
  }
}
