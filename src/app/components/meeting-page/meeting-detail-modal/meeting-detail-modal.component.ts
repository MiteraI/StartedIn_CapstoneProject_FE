import { Component, inject, Input, OnInit } from '@angular/core'
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { MeetingService } from 'src/app/services/meeting.service'
import { MeetingDetailModel } from 'src/app/shared/models/meeting/meeting-detail.model'
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message'
import { CommonModule, DatePipe } from '@angular/common'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { MeetingLabel, MeetingStatus } from 'src/app/shared/enums/meeting-status.enum'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { ContractType } from 'src/app/shared/enums/contract-type.enum'
import { Router } from '@angular/router'
import { ViewMeetingNotesModalComponent } from '../view-meeting-notes-modal/view-meeting-notes-modal.component'
import { MeetingNoteService } from 'src/app/services/meeting-note.service'
@Component({
  selector: 'app-meeting-detail-modal',
  templateUrl: './meeting-detail-modal.component.html',
  styleUrls: ['./meeting-detail-modal.component.scss'],
  standalone: true,
  imports: [NzDescriptionsModule, NzMessageModule, DatePipe, NzSkeletonModule, NzIconModule, CommonModule, NzButtonModule, NzModalModule],
})
export class MeetingDetailModalComponent implements OnInit {
  ContractType = ContractType
  readonly nzModalData = inject(NZ_MODAL_DATA)
  MeetingStatus = MeetingStatus

  meetingId: string = ''
  projectId: string = ''
  meetingDetail: MeetingDetailModel = {} as MeetingDetailModel
  loading = false

  constructor(
    private modalService: NzModalService,
    private meetingService: MeetingService,
    private nzMessage: NzMessageService,
    private router: Router,
    private nzModalRef: NzModalRef,
    private meetingNoteService: MeetingNoteService
  ) {
    this.meetingId = this.nzModalData.meetingId
    this.projectId = this.nzModalData.projectId
  }

  ngOnInit() {
    this.fetchMeetingDetail()
  }

  fetchMeetingDetail() {
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

  startMeeting() {
    this.meetingService.startMeeting(this.projectId, this.meetingId).subscribe({
      next: () => {
        this.nzMessage.success('Bắt đầu cuộc họp thành công')
        this.meetingService.refreshMeeting$.next(true)
        this.fetchMeetingDetail()
      },
      error: (error) => {
        this.nzMessage.error(error)
      },
    })
  }

  endMeeting() {
    this.meetingService.completeMeeting(this.projectId, this.meetingId).subscribe({
      next: () => {
        this.nzMessage.success('Kết thúc cuộc họp thành công')
        this.meetingService.refreshMeeting$.next(true)
        this.fetchMeetingDetail()
      },
      error: (error) => {
        this.nzMessage.error(error)
      },
    })
  }

  navigateToContract(contractType: ContractType, contractId: string) {
    console.log(contractType)
    this.nzModalRef.close()

    this.nzModalRef.afterClose.subscribe(() => {
      this.router.navigate([
        '/projects',
        this.projectId,
        contractType === ContractType.INVESTMENT
          ? 'investment-contract'
          : contractType === ContractType.INTERNAL
          ? 'internal-contract'
          : contractType === ContractType.LIQUIDATIONNOTE
          ? 'liquidation-contract'
          : '',
        contractId,
      ])
    })
  }

  getMeetingNotes() {
    this.meetingNoteService.getMeetingNotes(this.projectId, this.meetingId).subscribe({
      next: (response) => {
        this.meetingDetail.meetingNotes = response
      },
      error: (error) => {
        console.error('Error:', error)
      },
    })
  }

  openUploadModal() {
    const modalRef = this.modalService.create({
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzContent: ViewMeetingNotesModalComponent,
      nzData: { meetingId: this.meetingId, projectId: this.projectId },
      nzFooter: null,
      nzWidth: '500px',
    })
    modalRef.afterClose.subscribe(() => {
      this.getMeetingNotes()
    })
  }
}
