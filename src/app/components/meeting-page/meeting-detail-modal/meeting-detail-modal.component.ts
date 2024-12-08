import { Component, inject, Input, OnInit } from '@angular/core'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { MeetingService } from 'src/app/services/meeting.service'
import { MeetingDetailModel } from 'src/app/shared/models/meeting/meeting-detail.model'
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message'
import { DatePipe } from '@angular/common'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
@Component({
  selector: 'app-meeting-detail-modal',
  templateUrl: './meeting-detail-modal.component.html',
  styleUrls: ['./meeting-detail-modal.component.scss'],
  standalone: true,
  imports: [NzDescriptionsModule, NzMessageModule, DatePipe, NzSkeletonModule],
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
      },
      error: (error) => {
        this.nzMessage.error(error)
      },
    })
  }
}
