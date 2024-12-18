import { Component, inject, Input, OnInit } from '@angular/core'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { MeetingService } from 'src/app/services/meeting.service'
import { MeetingDetailModel } from 'src/app/shared/models/meeting/meeting-detail.model'
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message'
import { CommonModule, DatePipe } from '@angular/common'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { MeetingLabel, MeetingStatus } from 'src/app/shared/enums/meeting-status.enum'
import { NzIconModule } from 'ng-zorro-antd/icon'
@Component({
  selector: 'app-meeting-detail-modal',
  templateUrl: './meeting-detail-modal.component.html',
  styleUrls: ['./meeting-detail-modal.component.scss'],
  standalone: true,
  imports: [NzDescriptionsModule, NzMessageModule, DatePipe, NzSkeletonModule, NzIconModule, CommonModule],
})
export class MeetingDetailModalComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA)

  meetingId: string = ''
  projectId: string = ''
  meetingDetail: MeetingDetailModel = {} as MeetingDetailModel
  loading = false

  constructor(private meetingService: MeetingService, private nzMessage: NzMessageService) {
    this.meetingId = this.nzModalData.meetingId
    this.projectId = this.nzModalData.projectId
  }

  ngOnInit() {
    this.loading = true
    this.meetingService.getMeetingDetails(this.projectId, this.meetingId).subscribe({
      next: (response) => {
        this.meetingDetail = response
        this.loading = false
        console.log('Meeting detail:', this.meetingDetail)
      },
      error: (error) => {
        this.nzMessage.error(error)
      },
    })
  }

  getStatusIcon(): string {
    switch (this.meetingDetail.status) {
      case MeetingStatus.PROPOSED:
        return 'clock-circle'
      case MeetingStatus.ONGOING:
        return 'loading'
      case MeetingStatus.FINISHED:
        return 'check-circle'
      case MeetingStatus.CANCELLED:
        return 'close-circle'
      default:
        return 'question-circle'
    }
  }

  getStatusTheme(): 'outline' | 'fill' {
    return this.meetingDetail.status === MeetingStatus.ONGOING ? 'outline' : 'fill'
  }

  // Retrieve status label
  getMeetingStatusLabel(status: MeetingStatus): string {
    return MeetingLabel[status] || 'Không xác định'
  }

  getStatusColor(): string {
    switch (this.meetingDetail.status) {
      case MeetingStatus.PROPOSED:
        return 'text-blue-500'
      case MeetingStatus.ONGOING:
        return 'text-yellow-500'
      case MeetingStatus.FINISHED:
        return 'text-green-500'
      case MeetingStatus.CANCELLED:
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }
}
