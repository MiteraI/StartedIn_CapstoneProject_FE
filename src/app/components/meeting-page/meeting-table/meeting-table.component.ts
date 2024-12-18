import { Component, Input, OnInit } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalService } from 'ng-zorro-antd/modal'
import { NzTableModule } from 'ng-zorro-antd/table'
import { MeetingCreateModalComponent } from '../meeting-create-modal/meeting-create-modal.component'
import { MatIconModule } from '@angular/material/icon'
import { ViewMeetingNotesModalComponent } from '../view-meeting-notes-modal/view-meeting-notes-modal.component'
import { MeetingService } from 'src/app/services/meeting.service'
import { MeetingDetailModel } from 'src/app/shared/models/meeting/meeting-detail.model'
import { DatePipe } from '@angular/common'
import { MeetingLabel, MeetingStatus } from 'src/app/shared/enums/meeting-status.enum'
import { MeetingDetailModalComponent } from '../meeting-detail-modal/meeting-detail-modal.component'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message'

@Component({
  selector: 'app-meeting-table',
  templateUrl: './meeting-table.component.html',
  styleUrls: ['./meeting-table.component.scss'],
  standalone: true,
  imports: [NzTableModule, NzButtonModule, MatIconModule, DatePipe, NzToolTipModule, NzTagModule, NzMessageModule],
})
export class MeetingTableComponent implements OnInit {
  @Input({ required: true }) projectId = ''
  page = 1
  pageSize = 5
  total = 0
  listOfMeetings: MeetingDetailModel[] = []

  readonly MeetingLabel = MeetingLabel

  isLoading = false

  constructor(private modalService: NzModalService, private meetingService: MeetingService, private messageService: NzMessageService) {}

  ngOnInit() {
    // subsribe to refresh table data
    // this.meetingService.refreshMeeting$.subscribe(() => {
    //   this.getTableData()
    // })

    this.meetingService.refreshMeeting$.subscribe((shouldRefresh) => {
      if (shouldRefresh) {
        this.getTableData()
      }
    })
  }

  private getTableData() {
    this.isLoading = true
    this.meetingService.getTableData(this.projectId, this.page, this.pageSize).subscribe({
      next: (data) => {
        this.listOfMeetings = data.data
        this.total = data.total
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error:', error)
        this.isLoading = false
      },
    })
  }

  openCreateMeetingModal() {
    const modalRef = this.modalService.create({
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzContent: MeetingCreateModalComponent,
      nzData: {
        projectId: this.projectId,
        appendMode: false,
        appointmentTime: new Date().toISOString(),
      },
      nzFooter: null,
      nzWidth: '700px',
    })
  }

  openMeetingNote(meetingDetail: MeetingDetailModel) {
    const modalRef = this.modalService.create({
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzContent: ViewMeetingNotesModalComponent,
      nzData: { meetingNotes: meetingDetail.meetingNotes, meetingId: meetingDetail.id, projectId: this.projectId },
      nzFooter: null,
      nzWidth: '70%',
    })
  }

  openMeetingDetail(meetingDetail: MeetingDetailModel) {
    const modalRef = this.modalService.create({
      nzTitle: 'Chi Tiết Cuộc Họp',
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzData: { meetingId: meetingDetail.id, projectId: this.projectId },
      nzContent: MeetingDetailModalComponent,
      nzFooter: null,
      nzWidth: '70%',
    })
  }

  onPageIndexChange(newPage: number): void {
    this.page = newPage
    this.getTableData()
  }

  getStatusColor(status: MeetingStatus): string {
    switch (status) {
      case MeetingStatus.PROPOSED:
        return 'blue'
      case MeetingStatus.ONGOING:
        return 'gold'
      case MeetingStatus.FINISHED:
        return 'green'
      case MeetingStatus.CANCELLED:
        return 'red'
      default:
        return 'default'
    }
  }

  openCancelMeetingModal(meetingDetail: MeetingDetailModel) {
    const modalRef = this.modalService.confirm({
      nzTitle: 'Xác nhận',
      nzContent: 'Bạn có chắc chắn muốn hủy cuộc họp này?',
      nzOnOk: () => {
        this.cancelMeeting(meetingDetail)
      },
    })
  }

  cancelMeeting(meetingDetail: MeetingDetailModel) {
    this.meetingService.cancelMeeting(this.projectId, meetingDetail.id).subscribe({
      next: () => {
        this.meetingService.refreshMeeting$.next(true)
        this.messageService.success('Hủy cuộc họp thành công')
      },
      error: (error) => {
        console.error('Error:', error)
        this.messageService.error(error.error)
      },
    })
  }
}
